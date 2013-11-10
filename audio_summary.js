var echo_key = 'HFDMPVWUXJIL0K3OL';
var json_data = '';


function getAudioAnalysis(title, artist){
  var url = 'http://developer.echonest.com/api/v4/song/search?api_key=' +
   echo_key + '&format=json&results=1';
   if(artist !== ''){
    url += '&artist=' + artist;
    }
    url += '&title=' + title +
   '&bucket=audio_summary&callback=?';
   $.get(url, function(data) {
       // optional stuff to do after success 
       // console.log(song);
      // json_data = data;
      var track = data.response.songs[0];
      $('#song_title').text(track.title);
      $('#artist_name').text(track.artist_name);
      $('#length').text(track.audio_summary.duration);
      var analysis = data.response.songs[0].audio_summary;
      var danceability = analysis.danceability;
      var energy = analysis.energy;
      var liveness = analysis.liveness;
      console.log('d: ' + danceability + ' e: ' + energy);
      var analysis_url = analysis.analysis_url;
      $.getJSON(analysis_url, function(song_data){
          json_data = song_data;
          addSection(song_data);
          var meanLoudness = addSegment(song_data, 0, 0);
          var brightness = addSegment(song_data, 1, 1);
          var dirOffset = 5;
          var loudnessDir = graphDerivative(meanLoudness, 0 + dirOffset);
          var brightnessDir = graphDerivative(brightness, 1 + dirOffset);

          var minBrightnessDir = sortMin(brightnessDir);
          console.log('brightness dir min works? ' + minBrightnessDir[0]);
          var maxBright = sortMax(brightness);
          console.log('brightness max works? ' + maxBright[0]);

                    var loudWithBright = segmentsInRange(meanLoudness,
                            (maxBright[0][0] - 5), (maxBright[0][0] + 5));
                    var dirLoudWithBright = segmentsInRange(loudnessDir,
                            (maxBright[0][0] - 5), (maxBright[0][0] + 5));


          var loudnessMax = sortMax(meanLoudness);
          console.log('loudness max: ' + loudnessMax[0]);
          console.log('loudness dir max: ' + sortMax(loudnessDir)[0]);
          // addSegment(song_data, 2, 2);
          // addSegment(song_data, 3, 3);
          // addSegment(song_data, 4, 4);


          console.log('max loud next to bright ' + sortMax(loudWithBright)[0]);
          console.log('max loud dir next to bright ' + sortMax(dirLoudWithBright)[0]);
          var sectionSegments = segmentsIntoSections(song_data);
          sectionAnalysis(sectionSegments);
          // console.log(hc_segment_format);
          dropFinder(segmentsIntoSections(song_data));
       });
   });
}

function sortMin(segments){
  segments.sort(function(a, b){
            return a[1] - b[1];
          });
  return segments;
}

function sortMax(segments){
  segments.sort(function(a, b){
            return b[1] - a[1];
          });
  return segments;
}

function segmentsInRange(segments, lower, upper){
  var i = 0;
  // console.log('lower : ' + lower);
  // console.log('upper : ' + upper);
  // console.log(segments[0][0]);
  while(segments[i][0] < lower){
    i++;
  }
  var segsInRange = [];
  while(segments[i][0] < upper){
    segsInRange.push(segments[i]);
    // console.log('in range ' + segments[i][0]);
    i++;
  }
  return segsInRange;
}

function segmentsIntoSections(song){
  var sections = song.sections;
  var segments = song.segments;
  var sectionTimes = [];
  var segmentsInSections = [];

  //create section buckets
  for(var i = 0; i < sections.length; i++){
    var total = sections[i].start + sections[i].duration;
    sectionTimes.push(total);
    segmentsInSections[i] = [];
  }

  //Put segments into coresponding sections
  for(var j = 0; j < segments.length; j++)
  {
    var k = 0;
    while(segments[j].start > sectionTimes[k]){
      k++;
    }
    segmentsInSections[k].push(segments[j]);
  }
  // console.log(segmentsInSections);
  return segmentsInSections;
}

function sectionAnalysis(sectionData){
  var meanLoudnessPerSection = [];
  for(var i = 0; i < sectionData.length; i++){
    meanLoudnessPerSection.push(calcMeanLoudness(sectionData[i]));
  }
  return meanLoudnessPerSection;
}

function calcMeanLoudness(segments){
  var mean = 0;
  for(var i = 0; i < segments.length; i++)
  {
    mean += segments[i].timbre[0];
  }
  // console.log(mean / segments.length);
  return mean / segments.length;
}

function dropFinder(sectionSegments){
  var pos_diff = 0;
  var diff_section = 0;
  var sectionLoudness = sectionAnalysis(sectionSegments);
  for(var i = 0; i < sectionLoudness.length; i++)
  {
    if(i - 1 > 0){
      var diff = sectionLoudness[i] - sectionLoudness[i-1];
      console.log("diff = " + diff);
      if(diff > pos_diff){
        pos_diff = diff;
        diff_section = i - 1;
      }
    }
  }
  console.log(diff_section);
  var loudness_confidence = Math.min(1, (pos_diff / 10));
  console.log('confidence = ' + loudness_confidence);
  var greatest_db_change;
	
	var drop_segments = sectionSegments[diff_section].concat(sectionSegments[diff_section+1]);
	var greatest_segment_diff = 0;
	for(var j =0; j < drop_segments.length; j+=5) {
		
	}
	
	
}

function addSegment(song_data, series, timbre){
  var chart = $('#container').highcharts();
  var segments = song_data.segments;
  var movingAverage = 10;

  var data = [];
  for(var i = movingAverage; i < segments.length; i++){
    var average = 0;
    for(j = 0; j < movingAverage; j++)
    {
      average += segments[i - j].timbre[timbre];
    }
    var time = (segments[i - (movingAverage / 2)].start + segments[i - (movingAverage / 2)].loudness_max_time);
    var meanTimbre = average / movingAverage;
    var seg = [ time, meanTimbre];
    data.push(seg);
  }
  chart.series[series].setData(data);
  return data;
}

function graphDerivative(segAttributes, series){
  var chart = $('#container').highcharts();
  var movingAverage = 10;
  var data = [];

  for(var i =movingAverage; i < segAttributes.length - 1; i++){
    var average = 0;
    for(var j = 0; j < movingAverage; j++)
    {
      average += (segAttributes[i-j+1][1] - segAttributes[i-j][1]);
    }
    var meanD = average / movingAverage;
    // var diff = segAttributes[i+1][1] - segAttributes[i][1];
    var seg = [segAttributes[i - (movingAverage / 2)][0], meanD];
    data.push(seg);
  }
  chart.series[series].setData(data);
  return data;
}

function addSection(song_data){
  var chart = $('#container').highcharts();
  var sections = song_data.sections;
  var data = [];
  data.push([0, 1]);
  for (var j = 0; j < sections.length; j++){
    var total = sections[j].start + sections[j].duration;
    data.push([total, sections[j].confidence]);
    // console.log([total, sections[i].confidence]);
  }
  chart.series[1].setData(data);
}

