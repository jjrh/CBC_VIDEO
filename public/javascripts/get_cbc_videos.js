

var show_list=["Power%20and%20Politics",
	       "the%20nature%20of%20things",
	       "The%20National%20-%20Full%20Show",
	       "The%20Exchange%20with%20Amanda%20Lang",
	       "THE%20FIFTH%20ESTATE" ];

var video_template = null; // handlebars template

function format_date(d){ return d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0]; }

function get_video(showname,range){
    var new_url = "http://feed.theplatform.com/f/h9dtGB/r3VD0FujBumK?%27+%22&form=json&range=1-"+range+"&sort=added|desc&pretty=true&byCustomValue={show}{"+showname+"}"

    /* do the template */
    $.get('/video_template.html', function(template) {
	video_template = Handlebars.compile(template); //,media_release)
	/* call this here since we have a hard dependency that the template was pulled first. */
	$.ajax({
	    dataType: "json",
	    url: new_url,
	    success: success
	});
    })
}


function success(result){
    for(var i=0; i<result.entries.length; i++){
	var entry=result.entries[i];
	console.log(entry)
	parse_media_content(entry.media$content, entry);
    }
    setup_listeners();
}


function parse_media_content(content_arr, entry){
    console.log("media_parse", entry.guid)

    var media_release = {
	SRT:"",
	urls:[],
	guid: entry.guid,
	date: format_date(new Date(entry.pubDate)),
	title: entry.title
    };
    console.log(content_arr);
    for(var i=0; i<content_arr.length; i++){
	var item = content_arr[i];
	//	console.log(item);
	if(item.plfile$format == "SRT"){ // subtitle
	    media_release.SRT=item.plfile$downloadUrl;
	}
	if(item.plfile$format == "MP3"){
	    media_release.urls.push(item.plfile$downloadUrl)
	}

	if(item.plfile$format == "MPEG4"){ // video
	    var video_item = {url:"", quality:""}

	    video_item.url=item.plfile$downloadUrl;

	    // get the quality
	    var re = /[0-9]*x[0-9]*_[0-9]*kbps/;
	    var qua=item.plfile$downloadUrl.match(re);
	    if(qua == null){
		var re = /[0-9]*kbps/;
		var qua=item.plfile$downloadUrl.match(re);
		if(qua == null){
		    console.log("regex failed twice...",item.plfile$downloadUrl);
		    qua = [""]; // set to nothing so qua[0] doesn't fail
		}
	    }
	    video_item.quality = qua[0];
	    media_release.urls.push(video_item);
	}
    }
    var rendered = video_template(media_release);
    $("#videos").append(rendered);
}



function setup_listeners(){
    $(".quality__button").unbind();
    $(".quality__button").click(function(btn){
	var clicked_id = $(btn.currentTarget).attr('id');
	var video_id = clicked_id.replace("btn","videos");
	var videos_cont= video_id.split("__")
	// videos_cont = videos_cont.filter(function(v,k){ if(v.length >0){ return v} })
	// console.log(videos_cont);
	videos_cont=videos_cont[0]+"__"+videos_cont[1]
	$("."+videos_cont).hide();
	console.log(videos_cont)
	//	$("."+
	$("#"+video_id).show();

    })
    $("button[index='1']").click();
    console.log("listeners called");

}
