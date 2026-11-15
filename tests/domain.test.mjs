import test from "node:test";
import assert from "node:assert/strict";
import { seedDemo, createTrip, sellSeat, occupiedSeats, ticketFor, boardTicket, cancelTicket, summary, closeCash } from "../src/domain.mjs";

test("dos operadores no comparten rutas, boletos ni caja", () => {
  const s = seedDemo();
  const t = sellSeat(s, "operador-costa", "trip-c1", 1, "Pasajero ficticio");
  assert.throws(() => sellSeat(s, "operador-lago", "trip-c1", 1, "Pasajero ajeno"), /inexistente/);
  assert.throws(() => ticketFor(s, "operador-lago", t.code), /inexistente/);
  assert.throws(() => boardTicket(s, "operador-lago", t.code), /inexistente/);
  assert.equal(summary(s, "operador-lago").sold, 0);
  assert.equal(summary(s, "operador-costa").sold, 1);
});
test("un asiento no se vende dos veces y se libera al anular", () => {
  const s = seedDemo();
  const t = sellSeat(s, "operador-costa", "trip-c1", 3, "Pasajero Demo");
  assert.throws(() => sellSeat(s, "operador-costa", "trip-c1", 3, "Otro pasajero"), /ocupado/);
  assert.deepEqual(occupiedSeats(s, "operador-costa", "trip-c1"), [3]);
  cancelTicket(s, "operador-costa", t.code);
  assert.deepEqual(occupiedSeats(s, "operador-costa", "trip-c1"), []);
  sellSeat(s, "operador-costa", "trip-c1", 3, "Nuevo pasajero");
  assert.equal(summary(s, "operador-costa").sold, 1);
});
test("control de embarque de un solo uso y asientos", () => {
  const s = seedDemo();
  const t = sellSeat(s, "operador-costa", "trip-c1", 12, "Pasajero Demo");
  assert.throws(() => sellSeat(s, "operador-costa", "trip-c1", 13, "Pasajero Demo"), /inexistente/);
  boardTicket(s, "operador-costa", t.code);
  assert.throws(() => boardTicket(s, "operador-costa", t.code), /utilizado/);
  assert.throws(() => cancelTicket(s, "operador-costa", t.code), /embarcar/);
});
test("cierre de caja calcula diferencia y bloquea ventas", () => {
  const s = seedDemo();
  sellSeat(s, "operador-costa", "trip-c1", 1, "Pasajero Demo");
  sellSeat(s, "operador-costa", "trip-c1", 2, "Pasajero Demo");
  const cash = closeCash(s, "operador-costa", 330);
  assert.equal(cash.expectedAmount, 360);
  assert.equal(cash.difference, -30);
  assert.equal(summary(s, "operador-lago").cash.status, "open");
  assert.throws(() => sellSeat(s, "operador-costa", "trip-c1", 4, "Pasajero Demo"), /Caja cerrada/);
  assert.throws(() => closeCash(s, "operador-costa", 0), /ya está cerrada/);
});
test("validaciones de salida y tenant", () => {
  const s = seedDemo();
  const input = { origin: "Valencia", destination: "Maracay", departure: "2027-04-10T08:00", mode: "Terrestre", seats: 10, fare: 100 };
  assert.throws(() => createTrip(s, "operador-costa", { ...input, seats: 0 }), /Capacidad inválida/);
  assert.throws(() => createTrip(s, "operador-costa", { ...input, mode: "Aéreo" }), /Modalidad inválida/);
  assert.throws(() => createTrip(s, "operador-costa", { ...input, destination: "Valencia" }), /distintos/);
  const trip = createTrip(s, "operador-lago", input);
  assert.equal(trip.tenantId, "operador-lago");
  assert.throws(() => occupiedSeats(s, "operador-costa", trip.id), /inexistente/);
});

test("salidas DEMO rechazan fechas imposibles y horarios fuera de rango", () => {
  const s=seedDemo();
  const baseline={origin:"Caracas",destination:"Valencia",mode:"Terrestre",seats:10,fare:100};
  const invalid=[
    "2027-02-29T08:00", "2027-02-30T08:00", "2027-04-31T08:00",
    "2027-13-10T08:00", "2027-00-10T08:00", "2027-01-00T08:00",
    "2027-10-10T24:00", "2027-10-10T12:60", "2027-10-10T99:59",
    "2027-1-10T08:00", "2027-10-10 08:00", "2000-01-01T08:00"
  ];
  for (const departure of invalid)
    assert.throws(()=>createTrip(s,"operador-costa",{...baseline,departure}),/Fecha y hora inválidas/,departure);
  const valid=createTrip(s,"operador-costa",{...baseline,departure:"2028-02-29T23:59"});
  assert.equal(valid.departure,"2028-02-29T23:59");
  assert.equal(s.trips.filter(x=>x.tenantId==="operador-costa").length,3);
});

test("campos numéricos vacíos o manipulados no producen tarifas, asientos ni cierres de caja", () => {
  const state = seedDemo();
  const baseline = { origin: "Cumaná", destination: "Barcelona", departure: "2027-09-10T11:30", mode: "Terrestre", seats: "10", fare: "0" };
  const beforeTrips = state.trips.length;
  for (const raw of ["", "  ", null, undefined, true, "0x10", "1e2", "-0", "1.2"]) {
    assert.throws(() => createTrip(state, "operador-costa", { ...baseline, fare: raw }), /Tarifa de demostración inválida/, String(raw));
    assert.throws(() => createTrip(state, "operador-costa", { ...baseline, seats: raw }), /Capacidad inválida/, String(raw));
  }
  assert.equal(state.trips.length, beforeTrips, "ninguna entrada inválida modifica las salidas");

  const trip = createTrip(state, "operador-costa", baseline);
  assert.equal(trip.fare, 0, "cero debe aceptarse solamente cuando es explícito");
  const ticketsBefore = state.tickets.length;
  for (const raw of ["", " ", null, undefined, true, "1e0", "0x1"]) {
    assert.throws(() => sellSeat(state, "operador-costa", trip.id, raw, "Pasajero Demo"), /Asiento inexistente/, String(raw));
  }
  assert.equal(state.tickets.length, ticketsBefore);
  const auditBefore = state.audit.length;
  for (const raw of ["", "   ", null, undefined, false, "0x10", "1e3"]) {
    assert.throws(() => closeCash(state, "operador-costa", raw), /Importe declarado inválido/, String(raw));
    assert.equal(summary(state, "operador-costa").cash.status, "open", "caja debe permanecer abierta");
  }
  assert.equal(state.audit.length, auditBefore, "no registrar cierres fallidos");
  assert.equal(closeCash(state, "operador-costa", "0").declaredAmount, 0);
});
