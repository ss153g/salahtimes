'use strict';var yesterDate=new Date(),tomorrDate=new Date(),jumuahDate=new Date(),timeBuffer=900000;var printDate=function(dateprint){return(dateprint.getMonth()+1)+'/'+dateprint.getDate()+'/'+dateprint.getFullYear();};var dateChange=function(time1,time2){return(time1.trim()!==time2.trim())?' changed':'';};var tr=function(tm){return tm.slice(0,-3);};var countDown=function(seconds_left){var hours,minutes,seconds;seconds_left=seconds_left/1000;hours=parseInt(seconds_left/3600,10);seconds_left=seconds_left%3600;minutes=parseInt(seconds_left/60,10);seconds=parseInt(seconds_left%60,10);return hours+'h, '+minutes+'m, '+seconds+'s';};var nextSalahIn=function(PT){var times=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'],y,z,i,j;PT[1]['SunriseI']=PT[1]['Sunrise'];for(i=1;i<3;i+=1){for(j in times){if(((z=(y=Date.parse(PT[i]['SalahDate']+' '+PT[i][times[j]+'I']))+timeBuffer)-Date.now())>0){return timeLeft(Date.parse(PT[i]['SalahDate']+' '+PT[i][times[j]]),y,z,times[j]);}}}};function timeLeft(t1,t2,t3,n){var stp=0,sec=0,secI=0,ct,m,msg,countdown;m=(n!=='Sunrise')?n+' iqama in progress...':'sunrise . . . . . .';msg=jQuery('.nextSalahIn');countdown=setInterval(function(){ct=Date.now();msg.html(((sec=t1-ct)>0)?n+' in: '+countDown(sec):((secI=t2-ct)>0)?'<b>'+n+' iqama</b> in: '+countDown(secI):((stp=t3-ct)>=0)?m:'');if(stp<0){init();clearInterval(countdown);}},1000);}
var init=function(){var PT,khateeb='TBD',todayDate=new Date();yesterDate.setDate(todayDate.getDate()-1);tomorrDate.setDate(todayDate.getDate()+1);jumuahDate.setDate(todayDate.getDate()+((todayDate.getDay()<6)?(5-todayDate.getDay()):6));var csvURL='https%3A%2F%2Fdocs.google.com%2Fspreadsheet%2Fpub%3Fkey%3D'+'0Al2IwKKfRN4ddDlHNWYxVjcwNWtYQUoza3RWVDBTQnc'+'%26single%3Dtrue%26output%3Dcsv%26gid%3D',yqlURL_khateeb="https://query.yahooapis.com/v1/public/yql?q="+"SELECT%20*%20FROM%20csv%20WHERE%20url%3D'"+csvURL+"1"+"'%20AND%20columns%3D'Day%2CDate%2CKhateeb'%20AND%20Date%3D'"+printDate(jumuahDate)+"'%20%7C%20truncate(count%3D1)&format=json&callback=",yqlURL_timetbl="http://query.yahooapis.com/v1/public/yql?q="+"SELECT%20*%20FROM%20csv%20WHERE%20url%3D'"+csvURL+"0"+"'%20AND%20columns%3D'SalahDate%2CFajr%2CFajrI%2CSunrise%2CDhuhr%2CDhuhrI%2CAsr%2CAsrI%2CMaghrib%2CMaghribI%2CIsha%2CIshaI'"+"%20AND%20(SalahDate%20%3D%20'"+printDate(yesterDate)+"'%20OR%20SalahDate%20%3D%20'"+printDate(todayDate)+"'%20OR%20SalahDate%20%3D%20'"+printDate(tomorrDate)+"')"+"%20%7C%20truncate(count%3D3)&format=json&callback=?";var salahRow=function(salahDate,salahtime){return(Date.parse(todayDate)>=(Date.parse(salahDate+' '+salahtime)+timeBuffer))?2:1;};jQuery.getJSON(yqlURL_khateeb,function(msg){khateeb=msg.query.results.row.Khateeb||khateeb;jQuery('div.khateeb').text(khateeb);});jQuery.getJSON(yqlURL_timetbl,function(msg){var html,salahDate,fajr,sunrise,dhuhr,asr,maghrib,isha;html='<tr><td colspan="2">adhan</td><td>iqama</td></tr>';PT=msg.query.results.row;salahDate=PT[1]['SalahDate'];fajr=salahRow(salahDate,PT[1]['FajrI']);sunrise=salahRow(salahDate,PT[1]['Sunrise']);dhuhr=salahRow(salahDate,PT[1]['DhuhrI']);asr=salahRow(salahDate,PT[1]['AsrI']);maghrib=salahRow(salahDate,PT[1]['MaghribI']);isha=salahRow(salahDate,PT[1]['IshaI']);html+='<tr><td class="timeofday">Fajr</td><td>'+tr(PT[fajr]['Fajr'])+'</td><td class="iqtime'+dateChange(PT[fajr-1]['FajrI'],PT[fajr]['FajrI'])+'">'+tr(PT[fajr]['FajrI'])+'</td></tr>'+'<tr><td class="timeofday">Sunrise</td><td>'+tr(PT[sunrise]['Sunrise'])+'</td><td>&nbsp;</td></tr>'+'<tr><td class="timeofday">Dhuhr</td><td>'+tr(PT[dhuhr]['Dhuhr'])+'</td><td class="iqtime">'+tr(PT[dhuhr]['DhuhrI'])+'</td></tr>'+'<tr><td class="timeofday">Asr</td><td>'+tr(PT[asr]['Asr'])+'</td><td class="iqtime'+dateChange(PT[asr-1]['AsrI'],PT[asr]['AsrI'])+'">'+tr(PT[asr]['AsrI'])+'</td></tr>'+'<tr><td class="timeofday">Maghrib</td><td>'+tr(PT[maghrib]['Maghrib'])+'</td><td class="iqtime">'+tr(PT[maghrib]['MaghribI'])+'</td></tr>'+'<tr><td class="timeofday">Isha</td><td>'+tr(PT[isha]['Isha'])+'</td><td class="iqtime'+dateChange(PT[isha-1]['IshaI'],PT[isha]['IshaI'])+'">'+tr(PT[isha]['IshaI'])+'</td></tr>'+'<tr><td class="timeofday">Jumuah</td><td>1:45</td><td>&nbsp</td></tr>'+'<tr><td class="timeofday">Khateeb</td><td colspan="2"><div class="khateeb">'+khateeb+'</div></td></tr>';jQuery('div.timing').html('<div class="nextSalahIn"></div><table class="salahtimes">'+html+'</table>');nextSalahIn(PT);}).fail(function(){jQuery('div.timing').html('An error occurred retrieving salah times.');});};(function($){$('div.timing').html('<div id="salahtimes">Loading prayer times...</div>');init();}
(jQuery));