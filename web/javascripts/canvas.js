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
        if(parameter.actions == null){
            parameter.actions = []
            parameter._actionsduration = 0;
        }
    }


    let starttime = 0;
    for(let i in parameters){
        let parameter = parameters[i];
        parameter._starttime = starttime;
        if(parameter.start){
            if(parameter.start.beforeduration)starttime += parameter.start.beforeduration;
        }
        if(parameter.actions){
            let actionsduration = 0;
            for(let j in parameter.actions){
                let action = parameter.actions[j];
                if(action.duration){
                    starttime += action.duration;
                    actionsduration += action.duration;
                }
                if(action.afterduration){
                    starttime += action.afterduration;    
                    actionsduration += action.afterduration;
                }
            }
            parameter._actionsduration = actionsduration;
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
    "actions": [
        {
            "afterduration": 0,
            "disappear": false,
            "zoom": 1.0,
            "move": [136, 0],
            "rotate": 0,
            "duration": 1000
        },
        {
            "afterduration": 0,
            "zoom": 1.0,
            "move": [136, 0],
            "rotate": 0,
            "duration": 1000,
            "effect": "disappear"
        }   
    ]
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
    "actions": [{
        "afterduration": 0,
        "zoom": 1.0,
        "move": [204, 0],
        "rotate": 0,
        "duration": 1000
    }]
};

function draw(startTime, context, parameter) {
    let time = (Date.now() - startTime)%parameter._period;



    let start = parameter.start;
    let actions = parameter.actions;
    let postionX = parameter._pos * 68;

    // console.log(time, start.beforeduration +parameter._starttime);
    if(time < start.beforeduration + parameter._starttime){
        context.drawImage(parameter._imageObject, postionX+2 + start.move[0], 2+ start.move[1], 64*start.zoom, 64*start.zoom);
        return;
    }
    
    let actionsduration = parameter._starttime + start.beforeduration;
    let actionszoom = start.zoom;
    let actionsmove = start.move;
    let zooms = 1.0;
    let moves = [0, 0];
    for(let i in actions){
        let action = actions[i];
        zooms = action.zoom;
        moves = action.move;
        let previousduration = actionsduration;
        let previouszoom = actionszoom;
        let previousmove = actionsmove;
        actionsduration += action.duration;
        actionszoom = action.zoom;
        actionsmove = action.move;
        if(time < actionsduration){
            let ratio = (time - previousduration) / action.duration;
            let zoomRatio = (action.zoom - previouszoom)*ratio + start.zoom;
            let moveRatio = [(action.move[0] - previousmove[0])*ratio + previousmove[0], (action.move[1] - previousmove[1])*ratio+previousmove[1]];
            if(action.effect == "disappear"){
                context.save();
                context.globalAlpha = 1-ratio;
                context.drawImage(parameter._imageObject, postionX+2 + moveRatio[0], 2+ moveRatio[1], 64*action.zoom*zoomRatio, 64*action.zoom*zoomRatio);    
                context.restore();
            }else{
                context.globalAlpha = 1;
                context.drawImage(parameter._imageObject, postionX+2 + moveRatio[0], 2+ moveRatio[1], 64*action.zoom*zoomRatio, 64*action.zoom*zoomRatio);    
            }
            return;
        }
        actionsduration += action.afterduration;
        if(time < actionsduration){
            let ratio = 1.0;
            context.drawImage(parameter._imageObject, postionX+2 + action.move[0]*ratio, 2+ action.move[1]*ratio, 64*action.zoom*ratio, 64*action.zoom*ratio);
            return;
        }

    }
    context.drawImage(parameter._imageObject, postionX+2 + moves[0], 2+ moves[1], 64*zooms, 64*zooms);

    return;
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
