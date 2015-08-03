'use strict';
var PT, todayDate = new Date(), yesterDate = new Date(), tomorrDate = new Date(), jumuahDate = new Date(), timeBuffer = 900000;
yesterDate.setDate(todayDate.getDate() - 1);
tomorrDate.setDate(todayDate.getDate() + 1);
jumuahDate.setDate(todayDate.getDate() + ((todayDate.getDay() < 6) ? (5 - todayDate.getDay()) : 6));
var printDate = function (dateprint) {
	return (dateprint.getMonth() + 1) + '/' + dateprint.getDate() + '/' + dateprint.getFullYear();
};
var dateChange = function (time1, time2) {
	return (time1.trim() !== time2.trim()) ? ' changed' : '';
};
var salahRow = function (salahDate, salahtime) {
	return (Date.parse(todayDate) > (Date.parse(salahDate + ' ' + salahtime) + timeBuffer)) ? 2 : 1;
};
var tr = function (tm) {
	return tm.slice(0, -3);
};
var yqlURL_khateeb = "https://query.yahooapis.com/v1/public/yql?q=SELECT%20*%20FROM%20csv%20WHERE%20url%3D'https%3A%2F%2Fdocs.google.com%2Fspreadsheet%2Fpub%3Fkey%3D0Al2IwKKfRN4ddDlHNWYxVjcwNWtYQUoza3RWVDBTQnc%26single%3Dtrue%26gid%3D1%26output%3Dcsv'%20AND%20columns%3D'Day%2CDate%2CKhateeb'%20AND%20Date%3D'" + printDate(jumuahDate) + "'%20%7C%20truncate(count%3D1)&format=json&callback=";
var csvURL = 'https%3A%2F%2Fdocs.google.com%2Fspreadsheet%2Fpub%3Fkey%3D' + '0Al2IwKKfRN4ddDlHNWYxVjcwNWtYQUoza3RWVDBTQnc' + '%26single%3Dtrue%26gid%3D0%26output%3Dcsv';
var yqlURL = "http://query.yahooapis.com/v1/public/yql?q=" +
	"SELECT%20*%20FROM%20csv%20WHERE%20url%3D'" + csvURL +
	"'%20AND%20columns%3D'SalahDate%2CFajr%2CFajrI%2CSunrise%2CDhuhr%2CDhuhrI%2CAsr%2CAsrI%2CMaghrib%2CMaghribI%2CIsha%2CIshaI'" +
	"%20AND%20(SalahDate%20%3D%20'" + printDate(yesterDate) +
	"'%20OR%20SalahDate%20%3D%20'" + printDate(todayDate) +
	"'%20OR%20SalahDate%20%3D%20'" + printDate(tomorrDate) + "')" +
	"%20%7C%20truncate(count%3D3)&format=json&callback=?";
var countDown = function (seconds_left) {
	var hours,
		minutes,
		seconds;
	seconds_left = seconds_left / 1000;
	hours = parseInt(seconds_left / 3600, 10);
	seconds_left = seconds_left % 3600;
	minutes = parseInt(seconds_left / 60, 10);
	seconds = parseInt(seconds_left % 60, 10);
	return hours + 'h, ' + minutes + 'm, ' + seconds + 's';
};
var nextSalahIn = function (PT) {
	var times = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
		y, // aqama time
		z, // aqama + time buffer
		i, // 1 or 2
		j; // all salah times in the row
	PT[1]['SunriseI'] = PT[1]['Sunrise'];
	for (i = 1; i < 3; i += 1) {
		for (j in times) {
			if (((z = (y = Date.parse(PT[i]['SalahDate'] + ' ' + PT[i][times[j] + 'I'])) + timeBuffer) - Date.now() ) > 0) {
				// if the aqama time + buffer is greater than current time THEN send that salah time to counter
				return timeLeft(Date.parse(PT[i]['SalahDate'] + ' ' + PT[i][times[j]]), y, z, times[j]);
			}
		}
	}
	// if (i > 1) {chng date then fetch the next set of timing!}
};
/*
	t1: adhan time
	t2: iqama time
	t3: iqama + time buffer
	n:  salah name
*/
function timeLeft(t1, t2, t3, n) {
	var stp = 0,
		sec = 0,
		secI = 0,
		ct,
		m,
		msg,
		countdown;
	m = (n !== 'Sunrise') ? n + ' iqama in progress...' : 'sunrise . . . . . .';
	msg = jQuery('.nextSalahIn');
	countdown = setInterval(function () {
		ct = Date.now();
		msg.html(((sec = t1 - ct) > 0) ? n + ' in: ' + countDown(sec) : ((secI = t2 - ct) > 0) ? '<b>'+n+' iqama</b> in: ' + countDown(secI) : ((stp = t3 - ct) >= 0) ? m : '');
		if (stp < 0) {
			clearInterval(countdown);
			nextSalahIn(PT);			
		}
	}, 1000);
}
(function ($) {
	var khateeb = "TBD";
	$('div.timing').html('<center><div id="salahtimes">Loading prayer times...</div></center>');
	$.getJSON(yqlURL_khateeb, function (msg) {
		khateeb = msg.query.results.row.Khateeb || khateeb;
		$('div.khateeb').text(khateeb);
	});
	$.getJSON(yqlURL, function (msg) {
		var html,
			salahDate,
			fajr,
			sunrise,
			dhuhr,
			asr,
			maghrib,
			isha;
		html = '<tr><td colspan="2">adhan</td><td>iqama</td></tr>';
		PT = msg.query.results.row;
/*
timeBuffer = 60000; // 1 min
PT = [
	{
		Asr: "5:17 PM",
		AsrI: "6:00 PM",
		Dhuhr: "1:35 PM",
		DhuhrI: "1:45 PM",
		Fajr: "5:26 AM",
		FajrI: "5:45 AM",
		Isha: "9:43 PM",
		IshaI: "10:00 PM",
		Maghrib: "8:27 PM",
		MaghribI: "8:32 PM",
		SalahDate: "8/1/2015",
		Sunrise: "6:41 AM"
	},
	{
		Asr: "5:17 PM",
		AsrI: "6:00 PM",
		Dhuhr: "1:35 PM",
		DhuhrI: "2:23 PM",
		Fajr: "5:26 AM",
		FajrI: "5:45 AM",
		Isha: "9:43 PM",
		IshaI: "10:00 PM",
		Maghrib: "8:27 PM",
		MaghribI: "8:32 PM",
		SalahDate: "8/2/2015",
		Sunrise: "6:41 AM"
	},
	{
		Asr: "5:17 PM",
		AsrI: "6:00 PM",
		Dhuhr: "1:35 PM",
		DhuhrI: "1:45 PM",
		Fajr: "5:26 AM",
		FajrI: "5:45 AM",
		Isha: "9:43 PM",
		IshaI: "10:00 PM",
		Maghrib: "8:27 PM",
		MaghribI: "8:32 PM",
		SalahDate: "8/3/2015",
		Sunrise: "6:41 AM"
	}
];
// */
		salahDate = PT[1]['SalahDate'];
		fajr = salahRow(salahDate, PT[1]['FajrI']);
		sunrise = salahRow(salahDate, PT[1]['Sunrise']);
		dhuhr = salahRow(salahDate, PT[1]['DhuhrI']);
		asr = salahRow(salahDate, PT[1]['AsrI']);
		maghrib = salahRow(salahDate, PT[1]['MaghribI']);
		isha = salahRow(salahDate, PT[1]['IshaI']);
		html += '<tr><td class="timeofday">Fajr</td><td>' + tr(PT[fajr]['Fajr']) + '</td><td class="iqtime' + dateChange(PT[fajr - 1]['FajrI'], PT[fajr]['FajrI']) + '">' + tr(PT[fajr]['FajrI']) + '</td></tr>' +
			'<tr><td class="timeofday">Sunrise</td><td>' + tr(PT[sunrise]['Sunrise']) + '</td><td>&nbsp;</td></tr>' +
			'<tr><td class="timeofday">Dhuhr</td><td>' + tr(PT[dhuhr]['Dhuhr']) + '</td><td class="iqtime">' + tr(PT[dhuhr]['DhuhrI']) + '</td></tr>' +
			'<tr><td class="timeofday">Asr</td><td>' + tr(PT[asr]['Asr']) + '</td><td class="iqtime' + dateChange(PT[asr - 1]['AsrI'], PT[asr]['AsrI']) + '">' + tr(PT[asr]['AsrI']) + '</td></tr>' +
			'<tr><td class="timeofday">Maghrib</td><td>' + tr(PT[maghrib]['Maghrib']) + '</td><td class="iqtime">' + tr(PT[1]['MaghribI']) + '</td></tr>' +
			'<tr><td class="timeofday">Isha</td><td>' + tr(PT[isha]['Isha']) + '</td><td class="iqtime' + dateChange(PT[isha - 1]['IshaI'], PT[isha]['IshaI']) + '">' + tr(PT[isha]['IshaI']) + '</td></tr>' +
			'<tr><td class="timeofday">Jumuah</td><td>1:45</td><td>&nbsp</td></tr>' +
			'<tr><td class="timeofday">Khateeb</td><td colspan="2"><div class="khateeb">' + khateeb + '</div></td></tr>';
		$('div.timing').html('<center><div class="nextSalahIn" id="nextSalahIn"></div></center><center><table id="salahtimes">' + html + '</table></center>');
		nextSalahIn(PT);
	});
}
	(jQuery));
