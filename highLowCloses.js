/**
 * Session Levels
 * ---------------
 * Plots horizontal step-lines for:
 *   - Current trading day's High / Low
 *   - Previous trading day's High / Low / Close
 *   - Two trading days ago High / Low / Close
 *
 * Show/hide and color for each line are controlled from the indicator's
 * built-in "Line Styles" section (generated automatically from `plots` /
 * `schemeStyles` below) — no custom params needed for that.
 *
 * NOTE ON "TRADING DAY":
 * Futures sessions roll over in the evening (e.g. CME Globex opens ~6:00 PM
 * the day before), not at midnight. `sessionStartHour` / `sessionStartMinute`
 * let you set where a new trading day begins so the High/Low grouping lines
 * up with your contract's actual session, instead of the calendar date.
 * Set both to 0 if you'd rather use plain midnight-to-midnight days.
 */

const predef = require("./tools/predef");

function tradingDayKey(ts, startHour, startMinute) {
    const sessionStartMinutes = startHour * 60 + startMinute;
    const minutesOfDay = ts.getHours() * 60 + ts.getMinutes();

    const base = new Date(ts.getFullYear(), ts.getMonth(), ts.getDate());
    if (minutesOfDay >= sessionStartMinutes) {
        // This bar belongs to the session that opens today and is
        // conventionally labeled with tomorrow's calendar date.
        base.setDate(base.getDate() + 1);
    }
    return base.getFullYear() * 10000 + (base.getMonth() + 1) * 100 + base.getDate();
}

class sessionLevels {
    init() {
        this.curDay = undefined;
        this.curHigh = undefined;
        this.curLow = undefined;
        this.lastClose = undefined;

        this.prevHigh = undefined;
        this.prevLow = undefined;
        this.prevClose = undefined;

        this.prev2High = undefined;
        this.prev2Low = undefined;
        this.prev2Close = undefined;
    }

    map(d) {
        const day = tradingDayKey(
            d.timestamp(),
            this.props.sessionStartHour,
            this.props.sessionStartMinute
        );

        if (this.curDay === undefined) {
            this.curDay = day;
            this.curHigh = d.high();
            this.curLow = d.low();
        } else if (day !== this.curDay) {
            // Trading day rolled over: shift levels back one slot.
            this.prev2High = this.prevHigh;
            this.prev2Low = this.prevLow;
            this.prev2Close = this.prevClose;

            this.prevHigh = this.curHigh;
            this.prevLow = this.curLow;
            this.prevClose = this.lastClose;

            this.curDay = day;
            this.curHigh = d.high();
            this.curLow = d.low();
        } else {
            this.curHigh = Math.max(this.curHigh, d.high());
            this.curLow = Math.min(this.curLow, d.low());
        }

        this.lastClose = d.close();

        return {
            curHigh: this.curHigh,
            curLow: this.curLow,
            prevHigh: this.prevHigh,
            prevLow: this.prevLow,
            prevClose: this.prevClose,
            prev2High: this.prev2High,
            prev2Low: this.prev2Low,
            prev2Close: this.prev2Close
        };
    }
}

module.exports = {
    name: "sessionLevels",
    description: "High-Low-Close Today/Yesterday/Two Days Ago",
    calculator: sessionLevels,
    inputType: "bars",
    areaChoice: "overlay",
    tags: ["Crunch42"],

    params: {
        sessionStartHour: { type: "number", def: 18, restrictions: { step: 1, min: 0, max: 23 } },
        sessionStartMinute: { type: "number", def: 0, restrictions: { step: 1, min: 0, max: 59 } }
    },

    plots: {
        curHigh: { title: "Today's High" },
        curLow: { title: "Today's Low" },
        prevHigh: { title: "Prev Day's High" },
        prevLow: { title: "Prev Day's Low" },
        prevClose: { title: "Prev Day's Close" },
        prev2High: { title: "2 Days Ago High" },
        prev2Low: { title: "2 Days Ago Low" },
        prev2Close: { title: "2 Days Ago Close" }
    },

    plotter: [
        predef.plotters.singleline("curHigh"),
        predef.plotters.singleline("curLow"),
        predef.plotters.singleline("prevHigh"),
        predef.plotters.singleline("prevLow"),
        predef.plotters.singleline("prevClose"),
        predef.plotters.singleline("prev2High"),
        predef.plotters.singleline("prev2Low"),
        predef.plotters.singleline("prev2Close")
    ],

    schemeStyles: {
        dark: {
            curHigh: { color: "#CBCACA", lineWidth: 1, lineStyle: 1 },
            curLow: { color: "#CBCACA", lineWidth: 1, lineStyle: 1 },
            prevHigh: { color: "#589F06", lineWidth: 1, lineStyle: 1 },
            prevLow: { color: "#589F06", lineWidth: 1, lineStyle: 1 },
            prevClose: { color: "#589F06", lineWidth: 1, lineStyle: 5 },
            prev2High: { color: "#B8E986", lineWidth: 1, lineStyle: 1 },
            prev2Low: { color: "#B8E986", lineWidth: 1, lineStyle: 1 },
            prev2Close: { color: "#B8E986", lineWidth: 1, lineStyle: 5 }
        }
    }
};
