#!/usr/bin/env python3
"""E2E browser validation of the local-only, in-memory RutaTicket demonstrator."""
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 390, "height": 844})
    errors, requests = [], []
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    page.on("request", lambda req: requests.append(req.url))
    response = page.goto(BASE, wait_until="domcontentloaded")
    assert response and response.status == 200
    page.locator(".warning[role='note']").wait_for(state="visible", timeout=10000)
    assert page.locator(".warning").inner_text().startswith("Entorno demostrativo")
    assert "noindex" in (page.locator('meta[name="robots"]').get_attribute("content") or "")
    assert page.locator(".sidebar .side-note").count() == 1

    for width in (320, 390, 768, 1280):
        page.set_viewport_size({"width": width, "height": 844})
        overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        assert overflow <= 2, ("horizontal overflow", width, overflow)
    page.set_viewport_size({"width": 390, "height": 844})

    page.locator("#tenant").select_option("operador-costa")
    # Seat selection and booking must work via keyboard with honest DEMO status.
    seat = page.locator('[data-seat="2"]')
    seat.focus()
    seat.press("Enter")
    assert page.locator('[data-seat="2"]').get_attribute("aria-pressed") == "true"
    page.locator('#new-ticket input[name="alias"]').fill("Pasajero ficticio E2E")
    page.locator('#new-ticket button[type="submit"]').click()
    page.locator("#boletos tbody code").first.wait_for(state="visible", timeout=10000)
    code = page.locator("#boletos tbody code").first.inner_text()
    assert code.startswith("RT-")
    assert page.locator('[data-seat="2"]').is_disabled()
    assert "ningún pago" in page.get_by_role("status").inner_text().lower()

    page.locator("#tenant").select_option("operador-lago")
    assert page.locator("#boletos tbody code").count() == 0, "No cross-operator booking display"
    page.locator("#tenant").select_option("operador-costa")
    assert code in page.locator("#boletos tbody").inner_text()
    # App has no persistence or user accounts. Reload must discard demo tickets.
    page.reload(wait_until="domcontentloaded")
    page.locator(".warning").wait_for(state="visible", timeout=10000)
    assert page.locator("#boletos tbody code").count() == 0
    assert page.locator("#tenant").input_value() == "operador-costa"

    unexpected = [url for url in requests if urlsplit(url).netloc != urlsplit(BASE).netloc]
    assert not unexpected, ("unexpected remote network calls", unexpected)
    assert not errors, ("JavaScript errors", errors)
    print("RutaTicket: demo warning, 4 viewports, keyboard, tenant isolation, volatile state and no remote APIs verified")
    browser.close()
