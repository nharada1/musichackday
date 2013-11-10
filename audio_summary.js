var echo_key = 'HFDMPVWUXJIL0K3OL';
var json_data = '';
var duration = 0;

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
      duration = track.audio_summary.duration;
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
          // var dirOffset = 5;
          // var loudnessDir = graphDerivative(meanLoudness, 0 + dirOffset);
          // var brightnessDir = graphDerivative(brightness, 1 + dirOffset);
           var flatness = addSegment(song_data, 2, 2);
           //var flattnessDir = graphDerivative(flatness, 2 + dirOffset);
          // var minBrightnessDir = sortMin(brightnessDir);
          // console.log('brightness dir min works? ' + minBrightnessDir[0]);
           //var maxBright = trimStartAndFinish(sortMax(brightness));
          // maxBright = trimStartAndFinish(maxBright, duration);
           //console.log('brightness max works? ' + maxBright[0]);

          //           var loudWithBright = segmentsInRange(meanLoudness,
          //                   (maxBright[0][0] - 5), (maxBright[0][0] + 5));
          //           var dirLoudWithBright = segmentsInRange(loudnessDir,
          //                   (maxBright[0][0] - 5), (maxBright[0][0] + 5));


          // var loudnessMax = sortMax(meanLoudness);
          // console.log('loudness max: ' + loudnessMax[0]);
          // console.log('loudness dir max: ' + sortMax(loudnessDir)[0]);
          //  // addSegment(song_data, 2, 2);
          // // addSegment(song_data, 3, 3);
          // // addSegment(song_data, 4, 4);
          // //addPitches(song_data);

          // IF VALUE OF LOUDNESS around peak of brightness
          // is close to max loudness, could be drop.
          // Find large variance in sound and brightness.
          // cross reference with drop location
          // FLatness from positive to negative? Big drip in flatness
          // Big drop in flattness
          // Flatness almost never recovers quickly?

          var loudnessDir = graphDerivative(meanLoudness, 4);
          var loudnessD2 = graphDerivative(loudnessDir, 5);
          // loudnessD2Max = reduce(loudnessD2.slice(0), 0);
          // var loudnessD2AfterMax = [];
          // for (var za = 0; za < 10; za++) {
          //   // console.log('d2 peaks ' + loudnessD2Max[za]);
          //   var closeDirs = segmentsInRange(loudnessD2, loudnessD2Max[za][0], loudnessD2Max[za][0] + 2);
          //   var avgAfter = averageSegments(closeDirs);
          //   var diff = avgAfter - loudnessD2Max[za][1];
          //   // console.log('average dirs = ' + avgAfter);
          //   // console.log('diff in dirs = ' + diff);
          // }
          // var loudMax =  addLoudMax(song_data);




          //sharpest negative derivative in brightness by peak



          // Find high brightness, with falling flatness
          var flatCopy = flatness.slice(0);
          var maxFlatVals = reduce(flatCopy, 10);
          var maxBrightVals = reduce(brightness.slice(0), 10);


          var sectionData = [];
          var pointsOfInterest = [];
          var drops = [];
          var songSegs = song_data.segments;
          for(var sec = 0; sec < song_data.sections.length; sec++){
            sectionData[sec] = [];
            var localFlatness = reduce(segmentsInRange(flatness, song_data.sections[sec].start + 5, (song_data.sections[sec].start + song_data.sections[sec].duration + 10)), 20);
            if(localFlatness !== undefined && localFlatness.length > 0){
              // var localBrightDivs = graphDerivative(localBrights, 9);
              var localLoudness = reduce(segmentsInRange(loudnessD2, song_data.sections[sec].start + 5, (song_data.sections[sec].start + song_data.sections[sec].duration + 10)), 20);
              var localBrightness = brightness; //reduce(segmentsInRange(brightness, song_data.sections[sec].start + 5, (song_data.sections[sec].start + song_data.sections[sec].duration + 10)), 20);
              // console.log('loud testing ' + localLoudness);
              var largestLoudBrightCoorelationVal = 0;
              var largestLoudBrightCoorelation;
              for(var p = 0; p < localLoudness.length; p++){
                var loudAndBright = reduce(maxInRange(sortTime(localBrightness), localLoudness[p][0], localLoudness[p][0]+7));
                if(loudAndBright.length > 0){
                  // console.log( ' loud and bright ' + loudAndBright);
                  // var num = loudAndBright[0][1] * localLoudness[p][1];
                  var num = loudAndBright[0][1];
                  if(num > largestLoudBrightCoorelationVal){
                    largestLoudBrightCoorelation = loudAndBright;
                    largestLoudBrightCoorelationVal = num;
                  }

                }
                // console.log('greatest section coor ' + largestLoudBrightCoorelation);
                  if(largestLoudBrightCoorelation !== undefined){
                    pointsOfInterest.push(largestLoudBrightCoorelation);
                  }
                  largestLoudBrightCoorelationVal = 0;
                  largestLoudBrightCoorelation = [];
              }
            }

          }
          pointsOfInterest = cleanArray(pointsOfInterest);
          console.log(pointsOfInterest);
          for(var b = 0; b < pointsOfInterest.length; b++)
          {
            var segs = segmentsInRange(meanLoudness, pointsOfInterest[b][0][0], (pointsOfInterest[b][0][0] + 3));
            // console.log(pointsOfInterest[b][0][0] + ' ' + (pointsOfInterest[b][0] + 3));
            // console.log(segs);
              var aheadAverage = averageSegments(segmentsInRange(meanLoudness, pointsOfInterest[b][0][0], pointsOfInterest[b][0][0] + 5));
              var behindAverage = averageSegments(segmentsInRange(meanLoudness, pointsOfInterest[b][0][0] - 5, pointsOfInterest[b][0][0]));
              var currVal = segmentsInRange(meanLoudness, pointsOfInterest[b][0][0] - 0.5, pointsOfInterest[b][0][0] + 0.5)[0];
              // console.log('ahead avg: ' + aheadAverage + ' behindAverage: ' + behindAverage + ' nodeVal: ' + currVal[1] + ' pint: ' + pointsOfInterest[b]);
              var aheadDiff = aheadAverage - currVal[1];
              var behindDiff = behindAverage - currVal[1];
              console.log('ahead dif: ' + aheadDiff + ' behindDif: ' + behindDiff + ' nodeVal: ' + currVal[1] + ' pint: ' + pointsOfInterest[b]);
              if(behindDiff < -1.5){
                console.log('almost certain build at ' + currVal[0]);
              }
              if( (behindDiff < 0) ){
                // if( Math.abs(aheadDiff) < 0.5) {
                //   console.log(' very possible drop at ' + currVal[0]);
                // }
                if( aheadDiff > 0.5){
                  console.log(' very possible build at ' + currVal[0]);
                }
            }

          }

          function coorelateDSets(segs1, segs2, rangePos, rangeNeg){


          }

          // Check if max brights have nearby max flats
          var potentialDropsFlat = [];
          var potentialDropsBright = [];
          for(var z = 0; z < maxBrightVals.length; z++){
            var flatExists = maxInRange(sortTime(maxFlatVals), maxBrightVals[z][0]-3, maxBrightVals[z][0]+2);
            if(flatExists[0] !== undefined){
              potentialDropsFlat.push(sortMax(flatExists)[0]);
              potentialDropsBright.push(maxBrightVals[z]);
            }
          }

          // Check for large decrease if flats
          var inflextionPointsFlat = [];
          var inflextionPointsBright = [];
          for(var pot = 0; pot < potentialDropsFlat.length; pot++)
          {
            var checkMin = minInRange(flatness, potentialDropsFlat[pot][0], potentialDropsFlat[pot][0] + 8);
            if(checkMin[0][1] < 5){
              inflextionPointsFlat.push(potentialDropsFlat[pot]);
              inflextionPointsBright.push(potentialDropsBright[pot]);
            }
          }

          // CHECK IF BRIDGE IF DECREASE IN LOUDNESS
          // DROP IF INCREASE IN LOUDNESS
          // Look at 5 seconds before and after.
            // if before is louder than after, not a drop
            // if after is louder than before, drop
            // maybe derivatives more helpful here
            // if decreasing and decreasing, do nothing
            // if 

          sortMax(inflextionPointsBright);
          for(var sx = 0; sx < inflextionPointsBright.length; sx++)
          {
            // console.log(inflextionPointsBright[sx]);
          }

          //LOUDNESS MINS ARE GOOD
          // FIND MAXs AFTER MINS

          // IF SLOPE ON MIN LOUD IS STEEP ENOUGH
          // that means point of interest
          var loudnessMin = meanLoudness.slice(0);
          loudnessMin = reduce(loudnessMin, 10);
          loudnessMin = sortMin(loudnessMin);
          for (var ww = 0; ww < 6; ww++){
            // console.log('loudness mins: ' + loudnessMin[ww]);
          }
          //console.log(maxBrightVals);

          //MAX loudness where derivative is positive after it?

          // addLoudBegin(song_data);

          // console.log('max loud next to bright ' + sortMax(loudWithBright)[0]);
          // console.log('max loud dir next to bright ' + sortMax(dirLoudWithBright)[0]);
          // var sectionSegments = segmentsIntoSections(song_data);
          // sectionAnalysis(sectionSegments);
          // // console.log(hc_segment_format);
          // dropFinder(segmentsIntoSections(song_data));
       });
   });
}

function cleanArray(actual){
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
      if (actual[i]){
        newArray.push(actual[i]);
    }
  }
  return newArray;
}

function reduce(segments, filterMin){
  segments = trimStartAndFinish(segments, duration);
  sortMax(segments);
  var uniqueSegments = [];
  for(var i = 0; i < segments.length; i++){
    var toAdd = 1;
    // if(uniqueSegments.length > 1 && (uniqueSegments[0][1] - segments[i][1]) > 30){
    //   console.log('fucking up');
    //   break;
    // }
    for(var j = 0; j < uniqueSegments.length; j++){
      if( (Math.abs(segments[i][0] - uniqueSegments[j][0])) < 5 || segments[i][1] < filterMin) {
        toAdd = 0;
      }
    }
    if(toAdd === 1){
      uniqueSegments.push(segments[i]);
    }
  }
  return sortMax(uniqueSegments);
}

function trimStartAndFinish(segments, songLen){
  var minTrim = 30; // num seconds from start or end to trim
  var segs = [];
  for(var i = 0; i < segments.length; i++){
    if(segments[i][0] > minTrim && segments[i][0] < (duration - minTrim)){
      segs.push(segments[i]);
    }
  }
  return segs;
}

function sortMin(segments){
  segments.sort(function(a, b){
            return a[1] - b[1];
          });
  return segments;
}

function sortTime(segments){
    segments.sort(function(a, b){
            return a[0] - b[0];
          });
  return segments;
}

function averageSegments(segments){
  var average = 0;
  for(var i = 0; i < segments.length; i++){
    average += segments[i][1];
  }
  return average / segments.length;
}

function maxInRange(segments, lower, upper){
  return sortMax(segmentsInRange(segments, lower, upper));
}

function minInRange(segments, lower, upper){
  return sortMin(segmentsInRange(segments, lower, upper));
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
  while(segments[i] !== undefined && segments[i][0] < lower){
    i++;
  }
  var segsInRange = [];
  while(segments[i] !== undefined && segments[i][0] < upper){
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

// function dropFinder(sectionSegments){
//   var pos_diff = 0;
//   var diff_section = 0;
//   var sectionLoudness = sectionAnalysis(sectionSegments);
//   for(var i = 0; i < sectionLoudness.length; i++)
//   {
//     if(i - 1 > 0){
//       var diff = sectionLoudness[i] - sectionLoudness[i-1];
//       console.log("diff = " + diff);
//       if(diff > pos_diff){
//         pos_diff = diff;
//         diff_section = i - 1;
//       }
//     }
//   }
//   console.log(diff_section);
//   var loudness_confidence = Math.min(1, (pos_diff / 10));
//   console.log('confidence = ' + loudness_confidence);
//   var greatest_db_change;
	
// 	var drop_segments = sectionSegments[diff_section].concat(sectionSegments[diff_section+1]);
// 	var greatest_segment_diff = 0;
// 	for(var j =0; j < drop_segments.length; j+=5) {
		
// 	}
	
	
// }

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

function addLoudMax(song_data){
  var chart = $('#container').highcharts();
  var segments = song_data.segments;
  //var movingAverage = 10;

  var data = [];
  for(var i = 0; i < segments.length; i++){
    // var average = 0;
    // for(j = 0; j < movingAverage; j++)
    // {
    //   average += segments[i - j].timbre[timbre];
    // }
    var time = (segments[i].start + segments[i].loudness_max_time);
    var pitch =segments[i].loudness_max;
    var seg = [time, pitch];
    data.push(seg);
  }
  chart.series[8].setData(data);
  return data;
}

function addPitches(song_data){
  var chart = $('#container').highcharts();
  var segments = song_data.segments;
  //var movingAverage = 10;

  var data = [];
  for(var i = 0; i < segments.length; i++){
    // var average = 0;
    // for(j = 0; j < movingAverage; j++)
    // {
    //   average += segments[i - j].timbre[timbre];
    // }
    var time = (segments[i].start + segments[i].loudness_max_time);
    var pitch =segments[i].pitches.indexOf(Math.max.apply(Math, segments[i].pitches ));
    var seg = [time, pitch];
    data.push(seg);
  }
  chart.series[9].setData(data);
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
    var seg = [segAttributes[i - (movingAverage / 2)][0], meanD * 10];
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
  chart.series[10].setData(data);
}

