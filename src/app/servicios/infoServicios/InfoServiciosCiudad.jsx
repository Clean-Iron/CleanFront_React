'use client';

import React, { useMemo } from 'react';
import '@/styles/Servicios/InfoServicios/InfoServicios.css';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function parseISODateOnly(iso) {
  const [Y, M, D] = String(iso).split('-').map(Number);
  return new Date(Y, M - 1, D);
}

function isBetweenInclusive(isoDate, fromISO, toISO) {
  if (!isoDate) return false;
  const d = parseISODateOnly(isoDate);
  const df = parseISODateOnly(fromISO);
  const dt = parseISODateOnly(toISO);
  return d.getTime() >= df.getTime() && d.getTime() <= dt.getTime();
}

function monthNameES(m) {
  return [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ][m - 1];
}

function weekdayNameES(dow) {
  return ['DOMINGO','LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO'][dow];
}

function getWeeksOfMonthSimple(year, month0) {
  const lastDay = new Date(year, month0 + 1, 0).getDate();
  const weeks = [];
  for (let start = 1; start <= lastDay; start += 7) {
    weeks.push([start, Math.min(start + 6, lastDay)]);
  }
  return weeks;
}

function buildMonthDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const mm = pad2(month);
  const fromDateISO = `${year}-${mm}-01`;
  const toDateISO = `${year}-${mm}-${pad2(lastDay)}`;

  const df = parseISODateOnly(fromDateISO);
  const dt = parseISODateOnly(toDateISO);

  const dates = [];
  let current = new Date(df.getTime());
  while (current.getTime() <= dt.getTime()) {
    const iso = current.toISOString().slice(0, 10);
    dates.push({ iso, dayNum: current.getDate(), dow: current.getDay() });
    current.setDate(current.getDate() + 1);
  }

  return { dates, fromDateISO, toDateISO, lastDay };
}

function buildCityMonthEmployeesData(services, fromDateISO, toDateISO) {
  const employeesMap = new Map();
  const list = Array.isArray(services) ? services : [];

  list.forEach((item) => {
    if (!item?.serviceDate) return;
    if (!isBetweenInclusive(item.serviceDate, fromDateISO, toDateISO)) return;

    const srv = (item.services && item.services[0]) || {};

    const clientName = item.clientCompleteName || item.clientName || '';
    const city = item.city || '';
    const address = item.addressService || '';
    const startHour = item.startHour || '';
    const endHour = item.endHour || '';
    const hours = Number(item.totalServiceHours || 0);
    const state = item.state || '';
    const serviceDesc = srv.serviceDescription || '';
    const comments = item.comments || '';

    const isNoDisponible =
      clientName && clientName.toString().trim().toUpperCase() === 'NO DISPONIBLE';

    const hoursForTotals = isNoDisponible ? 0 : hours;

    const lines = [];
    lines.push(clientName);
    if (city) lines.push(city);
    if (address) lines.push(address);
    lines.push(`${startHour} A ${endHour}`);
    lines.push(`${hours} HORAS`);
    if (serviceDesc) lines.push(serviceDesc);
    if (state) lines.push(`Estado: ${state}`);
    if (comments) lines.push(`Obs: ${comments}`);

    const blockText = lines.join('\n');
    const keyDate = item.serviceDate;

    const employeesArr = Array.isArray(item.employees) ? item.employees : [];
    employeesArr.forEach((emp) => {
      const doc = emp?.employeeDocument || '';
      const name = (
        emp?.employeeCompleteName ||
        `${emp?.employeeName || ''} ${emp?.employeeSurname || ''}`
      ).trim();

      const empKey = doc || name || `${keyDate}-emp`;

      if (!employeesMap.has(empKey)) {
        employeesMap.set(empKey, {
          employeeKey: empKey,
          employeeName: name || '(SIN NOMBRE)',
          employeeDoc: doc,
          dayMap: new Map(),
        });
      }

      const empRec = employeesMap.get(empKey);

      if (!empRec.dayMap.has(keyDate)) {
        empRec.dayMap.set(keyDate, {
          blocks: [{ text: blockText, hours, startHour }],
          totalHours: hoursForTotals,
        });
      } else {
        const current = empRec.dayMap.get(keyDate);
        current.blocks.push({ text: blockText, hours, startHour });
        current.totalHours += hoursForTotals;
        empRec.dayMap.set(keyDate, current);
      }
    });
  });

  const employees = Array.from(employeesMap.values()).sort((a, b) =>
    (a.employeeName || '').localeCompare(b.employeeName || '', 'es', { sensitivity: 'base' })
  );

  return { employees };
}

const InfoServiciosCiudad = ({ services, filters, loading }) => {
  const year = filters?.year;
  const month = filters?.month;
  const city = (filters?.city || '').trim();

  const hasBaseFilters = !!(year && month && city);

  const computed = useMemo(() => {
    if (!hasBaseFilters) return null;

    const { dates, fromDateISO, toDateISO, lastDay } = buildMonthDates(year, month);
    const data = buildCityMonthEmployeesData(services, fromDateISO, toDateISO);

    // días a mostrar: día > semana > mes
    const week = filters?.week;
    const day = filters?.day;
    const weeks = filters?.weeks?.length ? filters.weeks : getWeeksOfMonthSimple(year, month - 1);

    let datesToShow = dates;

    if (day) {
      datesToShow = dates.filter((d) => d.iso === day);
    } else if (week) {
      const [d1, d2] = weeks[week - 1] || [null, null];
      if (d1 && d2) {
        datesToShow = dates.filter((d) => d.dayNum >= d1 && d.dayNum <= d2);
      }
    }

    return { datesToShow, lastDay, data };
  }, [hasBaseFilters, year, month, services, filters?.week, filters?.day, filters?.weeks]);

  return (
    <div className="info-servicios-ciudad">
      <div className="info-servicios-ciudad__panel">
        {!hasBaseFilters && (
          <div className="info-servicios-ciudad__emptyState">
            Selecciona ciudad, mes y año para ver la programación.
          </div>
        )}

        {hasBaseFilters && loading && (
          <div className="info-servicios-ciudad__emptyState">
            <span className="info-servicios-ciudad__spinner" />
            Consultando programación…
          </div>
        )}

        {hasBaseFilters && !loading && computed && (
          <>
            <div className="info-servicios-ciudad__tableShell">
              <table className="info-servicios-ciudad__table">
                <thead>
                  <tr className="thead-title">
                    <th className="info-servicios-ciudad__leftCol info-servicios-ciudad__title" />
                    <th
                      className="info-servicios-ciudad__title"
                      colSpan={Math.max(computed.datesToShow.length, 1)}
                    >
                      {`PROGRAMACIÓN CIUDAD ${city.toUpperCase()} — ${monthNameES(month).toUpperCase()} DEL 1 AL ${computed.lastDay} DE ${year}`}
                    </th>
                  </tr>

                  <tr className="thead-dow">
                    <th className="info-servicios-ciudad__leftLabel info-servicios-ciudad__leftCol">
                      ESPECIALISTA
                    </th>
                    {computed.datesToShow.map((d) => (
                      <th key={`dow-${d.iso}`} className="info-servicios-ciudad__dow">
                        {weekdayNameES(d.dow)}
                      </th>
                    ))}
                  </tr>

                  <tr className="thead-day">
                    <th className="info-servicios-ciudad__leftLabel info-servicios-ciudad__leftCol">
                      DÍA
                    </th>
                    {computed.datesToShow.map((d) => (
                      <th key={`day-${d.iso}`} className="info-servicios-ciudad__dayNum">
                        {d.dayNum}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {(computed.data.employees || []).map((emp, idx) => (
                    <React.Fragment key={emp.employeeKey || idx}>
                      <tr>
                        <td className="info-servicios-ciudad__leftCol info-servicios-ciudad__employeeName">
                          {emp.employeeName}
                        </td>

                        {computed.datesToShow.map((d) => {
                          const dayInfo = emp.dayMap.get(d.iso);

                          if (dayInfo?.blocks?.length) {
                            const blocksSorted = dayInfo.blocks
                              .slice()
                              .sort((a, b) => (a.startHour || '').localeCompare(b.startHour || ''));

                            const hasMultiple = blocksSorted.length > 1;
                            const separator = '────────────────────────';
                            const finalText = blocksSorted
                              .map((b, i) => (i === 0 ? b.text : `\n${separator}\n${b.text}`))
                              .join('\n\n');

                            const cellClass = hasMultiple
                              ? 'info-servicios-ciudad__cell info-servicios-ciudad__cell--multiple'
                              : 'info-servicios-ciudad__cell info-servicios-ciudad__cell--single';

                            return (
                              <td key={`${emp.employeeKey}-${d.iso}-block`} className={cellClass}>
                                {finalText}
                              </td>
                            );
                          }

                          return (
                            <td
                              key={`${emp.employeeKey}-${d.iso}-empty`}
                              className="info-servicios-ciudad__cell info-servicios-ciudad__cell--empty"
                            >
                              {d.dow !== 0 ? 'ATENTA A PROGRAMACIÓN' : ''}
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td className="info-servicios-ciudad__leftCol info-servicios-ciudad__totalsLabel">
                          HORAS TRABAJADAS
                        </td>

                        {computed.datesToShow.map((d) => {
                          const dayInfo = emp.dayMap.get(d.iso);
                          const val = typeof dayInfo?.totalHours === 'number' ? dayInfo.totalHours : '';
                          return (
                            <td key={`${emp.employeeKey}-${d.iso}-total`} className="info-servicios-ciudad__total">
                              {val === '' ? '' : Number(val).toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && (computed.data.employees || []).length === 0 && (
              <div className="info-servicios-ciudad__emptyState">
                Sin resultados.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InfoServiciosCiudad;
