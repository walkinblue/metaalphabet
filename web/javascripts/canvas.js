// let orders = [];
function ordering(parameters) {
    // console.log(parameters);
    for(let i in parameters){
        let parameter = parameters[i];
        if(parameter.order == null)parameter.order = -1;
    }
    for (let i = parameters.length - 1; i >= 0; i--) {
        for (let j = i; j < parameters.length - 1; j++) {
            let p0 = parameters[j];
            let p1 = parameters[j + 1];
            if (p0.order > p1.order) {
                parameters[j] = p1;
                parameters[j + 1] = p0;
            }
        }
    }
    return parameters;
}
function prepare(parameters){
    for(let i in parameters){
        let parameter = parameters[i];
        if(parameter.start == null){
            parameter.start = {
                move: [0,0],
                zoom: 1.0,
                beforeduration: 0,
                rotate: 0,
            }
        }
        if(parameter.action == null){
            parameter.action = {
                move: [0,0],
                zoom: 1.0,
                afterduration: 0,
                rotate: 0,
                duration: 0,
            }
        }
    }


    let starttime = 0;
    for(let i in parameters){
        let parameter = parameters[i];
        parameter._starttime = starttime;
        if(parameter.start){
            if(parameter.start.beforeduration)starttime += parameter.start.beforeduration;
        }
        if(parameter.action){
            if(parameter.action.duration)starttime += parameter.action.duration;
            if(parameter.action.afterduration)starttime += parameter.action.afterduration;
        }
    }

    let period = starttime;
    for(let i in parameters){
        let parameter = parameters[i];
        parameter._period = period;
    }

    for(let i in parameters){
        let parameter = parameters[i];
        parameter._imageObject = new Image();
        parameter._imageObject.src = parameter._image;
    }



    return parameters;
}



let test =
{
    "_starttime": 0,
    "_period": 0,
    "order": 0,
    "start": {
        "beforeduration": 0,
        "zoom": 1.0,
        "move": [0, 0],
        "rotate": 0
    },
    "action": {
        "afterduration": 0,
        "zoom": 1.0,
        "move": [136, 0],
        "rotate": 0,
        "duration": 1000
    }
};

let test2 =
{
    "order": 0,
    "start": {
        "beforeduration": 0,
        "zoom": 0,
        "move": [32, 32],
        "rotate": 0
    },
    "action": {
        "afterduration": 0,
        "zoom": 1.0,
        "move": [204, 0],
        "rotate": 0,
        "duration": 1000
    }
};

function draw(startTime, context, parameter) {
    let time = (Date.now() - startTime)%parameter._period;



    let start = parameter.start;
    let action = parameter.action;
    let postionX = parameter._pos * 68;

    // console.log(time, start.beforeduration +parameter._starttime);
    if(time < start.beforeduration + parameter._starttime){
        context.drawImage(parameter._imageObject, postionX+2 + start.move[0], 2+ start.move[1], 64*start.zoom, 64*start.zoom);
    }else if(time < (start.beforeduration + action.duration + parameter._starttime)){
        let ratio = (time - parameter._starttime) / action.duration;
        let zoomRatio = (action.zoom - start.zoom)*ratio + start.zoom;
        let moveRatio = [(action.move[0] - start.move[0])*ratio + start.move[0], (action.move[1] - start.move[1])*ratio+start.move[1]];
        context.drawImage(parameter._imageObject, postionX+2 + moveRatio[0], 2+ moveRatio[1], 64*action.zoom*zoomRatio, 64*action.zoom*zoomRatio);
    }else{
        let ratio = 1.0;
        context.drawImage(parameter._imageObject, postionX+2 + action.move[0]*ratio, 2+ action.move[1]*ratio, 64*action.zoom*ratio, 64*action.zoom*ratio);
    }    
}


var request = null;
var animateFunc = null;

export function stopping() {
    if (request) {
        window.cancelAnimationFrame(request);
        request = null;
    }
}

export function animating(canvas, parameters) {
    parameters = ordering(parameters);
    parameters = prepare(parameters);

    console.log(`animation...`);
    console.log(parameters);

    stopping();

    let start = new Date().getTime();
    let size = { width: canvas.width, height: canvas.height };
    let context = canvas.getContext('2d');

    animateFunc = function () {
        context.globalCompositeOperation = 'destination-over';
        context.clearRect(0, 0, size.width, size.height);
        for (let i = parameters.length - 1 ; i >= 0 ; i-- ){
            let parameter = parameters[i];
            draw(start, context, parameter);
        }
        if (request != null) {
            request = window.requestAnimationFrame(animateFunc);
        }
    }

    request = window.requestAnimationFrame(animateFunc);


    return;

}

// exports = {
//     animating : animating,
// }
    // for(index in paramters){
    //     let parameter = paramters[index];
    //     parameter.image = images[parameter.index];
    //     let order = parameter.order;
    //     if(order >= orders.length){
    //         orders.push([parameter]);
    //     }else{
    //         orders[order].push(parameter);
    //     }
    // }
        // testPop();
