// UTF8 without BOM

window.addEventListener( "DOMContentLoaded", 
    function() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            var ww = window.screen.width;
            var jw = document.querySelector('#JOG_table').clientWidth;
            var padding = 4;
            var w = jw + 2*padding;
            var ratio =  ww / w;

            document.querySelector('body').style.padding = padding + "px";

            document.querySelector('meta[name="viewport"]').content =
                'initial-scale=' + ratio + 
                ', maximum-scale=' + ratio + 
                ', minimum-scale=' + ratio + 
                ', width=' + w;
        }
    }
);
