# tradovate-high-low-close
This Tradovate indicator shows horizontal lines for the current high and low, yesterday's high, low, and close, and the high, low and close of two days ago.

In order for this to work properly, the high, low, and close of prior day(s) must appear in the bars that Tradovate is displaying in the chart.  This is limited to 5000 bars (Configure Chart Elements > Your Instrument) so some lines may not appear if you have a very short timeframe.  For example, if you have a ten second chart, 5000 bars won't reach back in time two days so you won't see the high, low, and close from two days ago.
