import {
  addDays,
  differenceInSeconds,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  min,
  parseISO,
  startOfDay,
  subDays
} from 'date-fns';

interface ClockifyTimeEntry {
  timeInterval: {
    start: string;
    end: string;
    duration: number;
  };
  projectName: string;
}

interface ClockifyResponse {
  timeentries: ClockifyTimeEntry[];
}

interface Week {
  startDate: Date;
  endDate: Date;
  timeEntriesPerProject: Map<string, ClockifyTimeEntry[]>;
}

interface InvoiceItem {
  description: string;
  hours: number;
  seconds: number;
}

export interface Invoice {
  totalHours: number,
  items: InvoiceItem[]
}

const getTimeEntries = async (workspaceId: string, apiKey: string, startDate: Date, endDate: Date) => {
  const fetchResult = await fetch(`https://reports.api.clockify.me/v1/workspaces/${workspaceId}/reports/detailed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey
    },
    body: JSON.stringify({
      dateRangeStart: startDate.toISOString(),
      dateRangeEnd: endDate.toISOString(),
      detailedFilter: {
        page: 1,
        pageSize: 500,
        sortColumn: 'DATE',
        options: {
          totals: 'EXCLUDE'
        }
      },
      sortOrder: 'ASCENDING',
      exportType: 'JSON',
      rounding: false,
      amountShown: 'HIDE_AMOUNT'
    })
  });

  const data = (await fetchResult.json()) as ClockifyResponse;

  return data.timeentries.filter((timeEntry) => timeEntry.projectName !== 'Out of Office');
};

const createWeeks = (startDate: Date, endDate: Date) => {
  const weeks = [];
  let week = {
    startDate,
    endDate: subDays(endOfWeek(startDate, { weekStartsOn: 1 }), 2),
    timeEntriesPerProject: new Map()
  } as Week;
  weeks.push(week);
  while (isBefore(week.endDate, endDate)) {
    const nextStartDate = startOfDay(addDays(week.endDate, 3));
    week = {
      startDate: nextStartDate,
      endDate: min([endOfDay(addDays(nextStartDate, 4)), endDate]),
      timeEntriesPerProject: new Map()
    } as Week;
    weeks.push(week);
  }
  return weeks;
};

const addTimeEntriesToWeeks = (timeEntries: ClockifyTimeEntry[], weeks: Week[]) => {
  for (const week of weeks) {
    for (const timeEntry of timeEntries) {
      const timeEntryStart = parseISO(timeEntry.timeInterval.start);
      const timeEntryEnd = parseISO(timeEntry.timeInterval.end);

      if (isAfter(timeEntryStart, week.startDate) && isBefore(timeEntryEnd, week.endDate)) {
        if (!week.timeEntriesPerProject.has(timeEntry.projectName)) {
          week.timeEntriesPerProject.set(timeEntry.projectName, []);
        }
        week.timeEntriesPerProject.get(timeEntry.projectName)?.push(timeEntry);
      }
    }
  }
};

const timeIntervalToSeconds = (timeEntry: ClockifyTimeEntry) => {
  const startDate = parseISO(timeEntry.timeInterval.start);
  const endDate = parseISO(timeEntry.timeInterval.end);

  return differenceInSeconds(endDate, startDate);
};

function createInvoiceItems(weeks: Week[]) {
  const invoiceItems: InvoiceItem[] = [];

  for (const week of weeks) {
    const projectNames = Array.from(week.timeEntriesPerProject.keys()).sort();
    for (const projectName of projectNames) {
      const totalDurationInSeconds =
        week.timeEntriesPerProject
          .get(projectName)
          ?.map(timeIntervalToSeconds)
          .reduce((currentSum, duration) => currentSum + duration, 0) || 0;

      const hours = totalDurationInSeconds / 60 / 60;
      const newInvoiceItem = {
        description: `${projectName}: ${format(
          week.startDate,
          'M/d'
        )} - ${format(week.endDate, 'M/d')}`,
        seconds: totalDurationInSeconds,
        hours: Math.round(hours * 100) / 100 // round to two decimals
      };

      invoiceItems.push(newInvoiceItem);
    }
  }

  return invoiceItems.filter((invoiceItem) => invoiceItem.description !== 'PTO/Holidays');
}

export const generateInvoice = async (workspaceId: string, apiKey: string, startDate: Date, endDate: Date) => {
  const timeEntries = await getTimeEntries(workspaceId, apiKey, startDate, endDate);

  const weeks = createWeeks(startDate, endDate);
  addTimeEntriesToWeeks(timeEntries, weeks);

  const invoiceItems = createInvoiceItems(weeks);

  return {
    totalHours: invoiceItems.reduce((sum, item) => sum + item.hours, 0),
    items: invoiceItems
  } as Invoice;
}