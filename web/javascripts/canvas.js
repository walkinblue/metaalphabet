// let orders = [];
function ordering(parameters){
    console.log(parameters);
    for(let i = parameters.length - 1 ;  i >= 0 ; i -- ){
        for(let j = i  ; j < parameters.length -1 ; j ++ ){
            let p0 = parameters[j];
            let p1 = parameters[j+1];
                if(p0.order > p1.order){
                parameters[j] = p1;
                parameters[j+1] = p0;
            }    
        }
    }
}



//  {
//     "order": 0, 
//     "start": {
//         "times" : 1.0,
//         "delay" : 0,
//         "move": [0,0],
//         "rotate": 0,
//         "period": 1000
//     },
//     "change": {
//         "times" : 1.0,
//         "blank" : 0,
//         "move" : [136,0],
//         "rotate": 0
//     }
//     }

function draw(start, context, parameter){
    
    
}


var request = null;
var animateFunc = null;

export function stopping(){
    if(request){
        window.cancelAnimationFrame(request);
        request = null;
    }
}

export function animating(canvas, parameters){
    console.log(parameters);
    parameters = ordering(parameters);
    console.log(parameters);

    this.stopping();

    let start = new Date();
    let size = {width: canvas.width, height : canvas.height};
    let context = canvas.getContext('2d');

    animateFunc = function(){
        context.globalCompositeOperation = 'destination-over';
        context.clearRect(0, 0, size.width, size.height);
        for(let index in parameters){
            let parameter = parameters[index];
            draw(start, context, parameter);
        }    

        if(request != null){
            request = window.requestAnimationFrame(animateFunc);
        }
    }

    request = window.requestAnimationFrame(animateFunc);

    // testPop();

    return;
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
}

// exports = {
//     animating : animating,
// }
