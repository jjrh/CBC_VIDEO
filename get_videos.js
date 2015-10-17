var request = require('request');

// http://cbcvideocontentconnector.appspot.com/?keyword=The+National&results=10
// https://github.com/misener/CBC-Content-Connector/blob/master/main.py
// this guy was helpful getting the right url scheme

var range = "100";

var show_list = ["Power%20and%20Politics",
                 "the%20nature%20of%20things",
                 "The%20National%20-%20Full%20Show",
                 "The%20Exchange%20with%20Amanda%20Lang",
                 "THE%20FIFTH%20ESTATE" ];


function find_hq(content) {

    for (var i=0; i<content.length; i++){
        if(content[i].url.indexOf("960x540") != -1){
            return content[i].url;
        }
    }
}


function munge_data(shows){
    for(var i=0; i<shows.length; i++){
        console.log("title:" + shows[i].title);
        console.log(find_hq(shows[i].content));

    }
}

function get_all_shows(r){
    var promise_count = 0;
    var all_shows = [];
    promises = [];
    for(var i=0; i<show_list.length; i++){
        var new_url = "http://feed.theplatform.com/f/h9dtGB/r3VD0FujBumK?%27+%22&form=json&range=1-"+range+"&sort=added|desc&pretty=true&byCustomValue={show}{"+show_list[i]+"}";
        console.log(new_url);

        var p1 = new Promise(function(resolve,reject){
            get_show(new_url,true,resolve,reject);
        });

        p1.then(function(val){
            all_shows.push(val);
        });
        promises.push(p1);
    }
    Promise.all(promises).then(function(){ munge_data(all_shows); });

}


get_all_shows();

function filter_duration(duration){
    if(duration > 20){  return true; } else {return false; }
}

function get_show(url, filter_by_duration, resolve,reject){
    request(url, function(err,response,body){
        r = JSON.parse(body);
        for(var i =0; i<r.entries.length;i++){
            var data = {};
            data['title'] = r.entries[i].title;
            var d = new Date(r.entries[i].pubDate);
            data['date'] = d;
            data['content'] = [];
            for(var k =0; k<r.entries[i]['media$content'].length; k++){
                content = r.entries[i]['media$content'][k];
                format = content['plfile$format'];
                if(format == "MPEG4" && filter_by_duration){
                    if(filter_duration(parseInt(content['plfile$duration'])/60)){
                        data['content'].push({'url': content['plfile$downloadUrl'], 'duration': parseInt(content['plfile$duration'])/60 });
                    }
                }
            }

            if(data.content.length >1){
                resolve(data);
            }
        }

    });
}
