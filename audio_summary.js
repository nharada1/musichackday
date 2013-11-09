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
      var analysis = data.response.songs[0].audio_summary;
      var danceability = analysis.danceability;
      var energy = analysis.energy;
      var liveness = analysis.liveness;
      console.log('d: ' + danceability + ' e: ' + energy);
      var analysis_url = analysis.analysis_url;
      $.getJSON(analysis_url, function(song_data){
          json_data = song_data;
          addSection(song_data);
          addSegment(song_data);

          var sectionSegments = segmentsIntoSections(song_data);
          sectionAnalysis(sectionSegments);
          // console.log(hc_segment_format);
          dropFinder(segmentsIntoSections(song_data));
       });
   });
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
  console.log(segmentsInSections);
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
  console.log(mean / segments.length);
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
  var loudness_confidence = Math.max(1, (pos_diff / 10));
  console.log(loudness_confidence);
  var greatest_db_change;


}

function addSegment(song_data){
  var chart = $('#container').highcharts();
  var segments = song_data.segments;
  var data = [];
  for(var i = 0; i < segments.length; i++){
    var time = (segments[i].start + segments[i].loudness_max_time);
    var seg = [ time, segments[i].timbre[0] ];
    data.push(seg);
  }
  chart.series[0].setData(data);
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

