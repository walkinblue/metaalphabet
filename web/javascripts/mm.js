import linesJson from '/data/lines.json' assert {type: 'json'};
import marksJson from '/data/marks.json' assert {type: 'json'};

function refreshData(){

}

function init() {
    console.log("mm.js init");
    let items = document.getElementById("items");
    items.innerHTML = "";
    if (linesJson) {
        for (let index in linesJson) {
            let line = linesJson[index];
            if(line.deleted)continue;

            let metaphors = line.metaphors;//metaphorsJson[index];
            addLine(index, line, metaphors, items);
        }
    }

    document.getElementById(`search_text`).addEventListener("keyup", searchKeyup);

    document.getElementById(`mp_image_url`).addEventListener("paste", function(e){
        let items = e.clipboardData.items;

        if(items == null)return;

        console.log(`find image paste`)
        for (let i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            
            // Retrieve image on clipboard as blob
            let blob = items[i].getAsFile();
    
            let objectURL = URL.createObjectURL(blob);
            document.getElementById(`mp_image`).src = objectURL;

            let file = new File([blob], "pasted_image.jpg",{type:"image/jpeg", lastModified:new Date().getTime()});
            let container = new DataTransfer();
            container.items.add(file);
            document.getElementById(`mp_image_file`).files = container.files;
        }
    });

    document.getElementById(`mp_image_file`).addEventListener("change", function(e){
        var reader = new FileReader();
        
        reader.onload = function (e) {
            document.getElementById(`mp_image`).src = e.target.result;
        };

        reader.readAsDataURL(document.getElementById(`mp_image_file`).files[0]);
    });
    document.getElementById(`mp_submit`).addEventListener("click", function(){
        let index = document.getElementById(`mp_index`).value;
        let mindex = document.getElementById(`mp_mindex`).value;
        document.getElementById(`mp_image_${index}_${mindex}`).src = document.getElementById(`mp_image`).src;
    });

    document.getElementById(`mp_input_new`).addEventListener("click", function(e){
        addLine(linesJson.length, {time: "now", line:"", decode:"", image:"NONE.png"}, [], items);
    });

}

function addLine(index, line, metaphors, items){
    // let line = linesJson[index];


    let item = document.createElement("div");
    // console.log(metaphors);

    let imagesString = "";

    for (let mindex in metaphors) {
        let metaphor = metaphors[mindex];
        let image = "/marks/NONE.png";
        if (marksJson[metaphor.mark.name])
            image = "/marks/" + marksJson[metaphor.mark.name].image;
        metaphor.mark.image = image;
        imagesString += `<div id="metaphor_${index}_${mindex}" class="metaphor">
                    <img id="mp_image_${index}_${mindex}" class="metaphorimage" src="${image}">
                    <div class="metaphorname">${metaphor.mark.name}</div>
                </div>`
    }
    imagesString = `<div class="metaphors" id="metaphors_${index}">` + imagesString + `</div>`;

    item.innerHTML =
        `<form method="post" action="/update">
                <div class="line">时间：${line.time}<input type="text" name="index" hidden value="${index}"/></div>
                <div class="line">语句：<input name="line" type="text" class="inputline" value="${line.line}"></div>
                <div class="line">解析：<textarea name="decode" class="inputarea">${line.decode}</textarea></div>
                <div class="line"><text style="width:42px"></text><input name="linesubmit" id="mp_${index}_updateline" type="submit" value="提交"><input name="decodefresh" id="mp_${index}_freshdecode" type="submit" value="恢复默认解析" style="margin-left:10px"><input name="lineremove" id="mp_${index}_removeline" type="submit" value="删除" style="margin-left:10px"></div>
                <div class="line">图片：${imagesString}</div>
            </form>`;
    items.appendChild(item);

    for (let mindex in metaphors) {
        document.getElementById(`metaphor_${index}_${mindex}`).addEventListener("click", function (e) { showMetaphor(index, mindex) });
    }

    document.getElementById(`mp_${index}_updateline`).addEventListener("click", function (e) {
        setTimeout(function(){
            location.reload(true);
        },500)
    });
    document.getElementById(`mp_${index}_freshdecode`).addEventListener("click", function (e) {
        setTimeout(function(){
            location.reload(true);
        },500)
    });
    document.getElementById(`mp_${index}_removeline`).addEventListener("click", function (e) {
        setTimeout(function(){
            location.reload(true);
        },500)
    });
}


function searchKeyup(e){
    updateUrl(e.target.value)
}

function updateUrl(value){
    let iconfontUrl = `https://www.iconfont.cn/search/index?searchType=icon&q=${value}&page=1&fromCollection=1&fills=&tag=`;
    let flaticonUrl = `https://www.flaticon.com/search?word=${value}`;
    let iconfinder = `https://www.iconfinder.com/search?q=${value}`;

    document.getElementById(`flaticon`).href =  flaticonUrl;
    document.getElementById(`iconfont`).href =  iconfontUrl;
    document.getElementById(`iconfinder`).href =  iconfinder;


    document.getElementById(`flaticon_text`).innerHTML =  value;
    document.getElementById(`iconfont_text`).innerHTML =  value;
    document.getElementById(`iconfinder_text`).innerHTML =  value;
}

var mpindexes = {};
var lastidiv = null;

function showMetaphor(index, mindex) {
    let mdiv = document.getElementById(`metaphors_${index}`);
    let vdiv = document.getElementById(`metaphorview`);
    let idiv = document.getElementById(`metaphor_${index}_${mindex}`);

    let indexes = { index: index, mindex: mindex };

    if(vdiv.style.display == "flex" && mpindexes.index == indexes.index && mpindexes.mindex == indexes.mindex){
        vdiv.style.display = "none";
        idiv.style.border = "1px solid #eeeeee";
        if(lastidiv != null)lastidiv.style.border = "1px solid #eeeeee";
        return;
    }
    idiv.style.border = "1px solid #ff0000";
    if(lastidiv != idiv && lastidiv != null)lastidiv.style.border = "1px solid #eeeeee";
    lastidiv = idiv;

    let value = linesJson[index].metaphors[mindex].mark.name;
    document.getElementById("search_text").value = value;
    updateUrl(value);

    mpindexes = indexes;

    document.getElementById(`mp_name`).innerHTML = linesJson[index].metaphors[mindex].mark.name;
    document.getElementById(`mp_image`).src =  linesJson[index].metaphors[mindex].mark.image;
    document.getElementById(`mp_data_name`).value = linesJson[index].metaphors[mindex].mark.name;
    document.getElementById(`mp_index`).value = index;
    document.getElementById(`mp_mindex`).value = mindex;
    
    console.log(index, mindex, mdiv.getBoundingClientRect().bottom);
    vdiv.style.top = mdiv.getBoundingClientRect().bottom + 5;
    vdiv.style.display = "flex";

}
init();


            // let item = document.createElement("div");
            // console.log(metaphors);

            // let imagesString = "";

            // for (let mindex in metaphors) {
            //     let metaphor = metaphors[mindex];
            //     let image = "/web/images/NONE.png";
            //     if(marksJson[metaphor.mark.name])
            //         image = "/marks/"+marksJson[metaphor.mark.name].image;
            //     metaphor.mark.image = image;
            //     imagesString += `<div id="metaphor_${index}_${mindex}" class="metaphor">
            //         <img id="mp_image_${index}_${mindex}" class="metaphorimage" src="${image}">
            //         <div class="metaphorname">${metaphor.mark.name}</div>
            //     </div>`
            // }
            // imagesString = `<div class="metaphors" id="metaphors_${index}">` + imagesString + `</div>`;

            // item.innerHTML =
            // `<form method="post" action="/update">
            //     <div class="line">时间：${line.time}<input type="text" name="index" hidden value="${index}"/></div>
            //     <div class="line">语句：<input name="line" type="text" class="inputline" value="${line.line}"><input name="linesubmit" id="mp_${index}_updateline" type="submit" value="提交" style="margin-left:10px"></div>
            //     <div class="line">解析：<textarea name="decode" class="inputarea">${line.decode}</textarea><input name="decodesubmit" id="mp_${index}_updatedecode" type="submit" value="提交" style="margin-left:10px"><input name="decodefresh" id="mp_${index}_freshdecode" type="submit" value="恢复默认" style="margin-left:10px"></div>
            //     <div class="line">图片：${imagesString}</div>
            // </form>`;
            // items.appendChild(item);
            // for (let mindex in metaphors) {
            //     document.getElementById(`metaphor_${index}_${mindex}`).addEventListener("click", function (e) { showMetaphor(index, mindex) });
            // }
            // document.getElementById(`mp_${index}_updateline`).addEventListener("click", function (e) {
            // });
            // document.getElementById(`mp_${index}_updatedecode`).addEventListener("click", function (e) {
            // });
            // document.getElementById(`mp_${index}_freshdecode`).addEventListener("click", function (e) {
            // });