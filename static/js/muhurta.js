$(document).ready(function() {

    var muhurta = function(intervalStart, intervalEnd, intervalNum, intervalCount) {
      var muhurta = (intervalEnd - intervalStart)/intervalCount
      var start = intervalStart + (intervalNum-1)*muhurta
      var end = start+muhurta
      return [start, end]
    }

    var getMuhurta = function() {
      var query = $("form[name='muhurta-form']").serialize();
      var phpQuery = "/get_muhurta?" + query;
      console.log(phpQuery);

      console.log($('#date').val())
      
      var zone_offset = parseInt($('#tz').val())
      var selected_date = luxon.DateTime.fromISO($('#date').val()).set({hour: 12, minute:30})

      var coord = A.EclCoord.fromWgs84($('#lat').val(), $('#lon').val(), 0);
      //var coord = A.EclCoord.fromWgs84( 47.3957, 8.4867, 440); // zurich

      var todayJ = new A.JulianDay(selected_date.toJSDate());
      var prevJ = new A.JulianDay(selected_date.minus({ days: 1 }).toJSDate());

      var todayTimes = A.Solar.times(todayJ, coord);
      var prevTimes = A.Solar.times(prevJ, coord);

      var prevSunset = selected_date.minus({days:1}).set({hour:0, minute:0}).plus({seconds: prevTimes.set}).plus({hours: zone_offset})
      var sunrise = selected_date.set({hour:0, minute:0}).plus({seconds: todayTimes.rise}).plus({hours: zone_offset})
      var sunset = selected_date.set({hour:0, minute:0}).plus({seconds: todayTimes.set}).plus({hours: zone_offset})

      var brahma_muhurta = muhurta(prevSunset.toSeconds(), sunrise.toSeconds(), 14, 15)
      var abhijit_muhurta = muhurta(sunrise.toSeconds(), sunset.toSeconds(), 8, 15)
      var time_opts = {
        includeOffset:false,
        suppressMilliseconds:true,
        suppressSeconds:true
      }

      $('#muhurta-parts').css('visibility', 'visible');
      $('#muhurta-day').text('Восход: ' + sunrise.toISOTime(time_opts) + '. Закат: ' + sunset.toISOTime(time_opts));
      $('#muhurta-brahma').text('Брахма-мухурта с ' + luxon.DateTime.fromSeconds(brahma_muhurta[0]).toISOTime(time_opts) + ' по ' + luxon.DateTime.fromSeconds(brahma_muhurta[1]).toISOTime(time_opts));
      $('#muhurta-abhijit').text('Абхиджит-мухурта с ' + luxon.DateTime.fromSeconds(abhijit_muhurta[0]).toISOTime(time_opts) + ' по ' + luxon.DateTime.fromSeconds(abhijit_muhurta[1]).toISOTime(time_opts));
    }

    $("form[name='muhurta-form']").submit(function(event){
      event.preventDefault();
      getMuhurta();
    });

    geoip2.city(
      function(geo){
        var tz = new luxon.IANAZone(geo.location.time_zone).formatOffset(0, 'short')
        console.log(tz)
        console.log(geo.location.time_zone);
        console.log(geo.location.latitude);
        console.log(geo.location.longitude);

        $('#city').val(geo.city.names.ru);
        $('#lat').val(geo.location.latitude);
        $('#lon').val(geo.location.longitude);
        $('#date').val(luxon.DateTime.now().toISODate('YYYY-MM-DD'));

        $('#tz option').filter(function () { return $(this).html() == tz; }).prop('selected', true);

        getMuhurta();

      },
      function(err){
          console.log(err);
      }
    );
});
