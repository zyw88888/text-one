//使用面向对象来编写
function Mine(tr,td,mineNum){
    this.tr = tr;   //行数
    this.td = td;   //列数
    this.mineNum = mineNum; //雷的数量

    this.squares = [];     //存储所有方块信息的一个二维数组，存取都可以
    this.tds = [];         //存储所有单元格的DOM
    this.surplusMine = mineNum;  //剩余雷的数量
    this.allRight = false;       //右击标的小红旗是否全是雷 用来判断是否游戏成功

    this.parent = document.querySelector('.gameBox');

}

// 生成n个不重复的数字
Mine.prototype.randomNum = function(){
    var square = new Array(this.tr*this.td); // 生成一个空数组，有长度且是格子的总数
    for(var i=0; i<square.length; i++){
        square[i] = i;
     }
    square.sort(function(){return 0.5-Math.random()});
    // console.log(square);
    return square.slice(0,this.mineNum);
  }
Mine.prototype.init = function(){
    // console.log(this.randomNum());
    var rn=this.randomNum(); //雷在格子里的位置
    var n=0; //找到格子对应的索引
    for(var i=0; i<this.tr;i++){
        this.squares[i] = [];

        for(var j=0;j<this.td;j++){
            // this.squares[i][j] =;
            // n++;
            //缺一个方块在数组里的数据行和列的方式去取，找方块周围的方块的时候要用坐标的方式去取，行与列的形式跟坐标的形式x,y
            //是刚好相反的
            if (rn.indexOf(++n)!=-1){
               //如果这个条件成立，说明现在循环到这个索引在雷的数组里找到了，那就表示这个索引对应的是个雷
               this.squares[i][j] = {type:'mine',x:j,y:i};
            
            }else{
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};

            }
        }
            /* 这是雷
            {
                 type:'mine',
                 x:0
                 y:0,
             }

              这是数字
             {
                 type:'unmber',
                 x:0,
                 y:0,
                 volue:2
             }*/
    
    }

   
    // console.log(this.squares);
    this.updateNum();
    this.createDom();
    //组织右键事件
    this.parent.oncontextmenu=function(){
        return false;
    }
    //剩余雷数
    this.mineNumDom=document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
};
//创建表格
Mine.prototype.createDom = function(){
    var table = document.createElement('table');
    var This=this;
    for(var i=0;i<this.tr;i++){   //行
        var domTr = document.createElement('tr');
        this.tds[i] = [];

        for(var j=0; j<this.td; j++){   //列
            var domTd = document.createElement('td');
            // domTd.innerHTML=0; 
            domTd.pos=[i,j];    //把格子的对应的行与列存在身上，为了下面通过这个值去数组里取到对应的数据
            domTd.onmousedown=function(){
              This.play(event,this);//This指的是实例对象 this指点击对象td
            };

            this.tds[i][j] = domTd;  //把所有创建的td添加到数组
              
            // if(this.squares[i][j].type=='mine'){
            //    domTd.className='mine';
            //   }

            //   if(this.squares[i][j].type=='number'){
            //     domTd.innerHTML=this.squares[i][j].value;
            //   }
           
            domTr.appendChild(domTd);
        }
       
        table.appendChild(domTr);
    }
    this.parent.innerHTML = ''; //避免重复添加棋盘
    this.parent.appendChild(table);

};
//找某个方格周围的8个方格
Mine.prototype.getAround = function(square){
      var x = square.x;
      var y = square.y;
      var result = []; //把找到的格子的坐标返回出去（二维数组）
     
      /*
     x-1,y-1  x,y-    x+1,y-1
     x-1,y    x,y     x+1,y
     x-1,y+1  x,y+1   x+1,y+1
     */
    
     //通过坐标去循环九宫格
     for(var i=x-1;i<=x+1;i++){
          for(var j=y-1;j<=y+1;j++){
          if(
              i<0 ||              //格子超出左边的范围
              j<0 ||              //格子超出上边的范围
              i>this.td-1 ||      //格子超出右边的范围
              j>this.tr-1 ||      //格子超出下边的范围
              (i==x && j==y) ||   //当前格子循环到的是自己
              this.squares[j][i].type =='mine'  //周围的格子是个雷
          ){
             continue;
          } 
          
          result.push([j,i]);    //要以行与列的形式返回去，因为到时候需要用它去取数组里的数量
         }

     }


      return result;

};
   Mine.prototype.updateNum = function(){
       for(var i=0; i<this.tr; i++){
           for(var j=0;j<this.td;j++){
             //只更新雷周围的数字
             if(this.squares[i][j].type=='number'){
               continue;
             }
             var num = this.getAround(this.squares[i][j]); //获取雷周围的数字
             
             for(var k=0; k<num.length;k++){
                
                /*num[k] == [0, 1]
                num[k][0] == 0
                num[k][1] == 1*/


                this.squares[num[k][0]][num[k][1]].value += 1;
             }
            }
        } 
        // console.log(this.squares);
     }
Mine.prototype.play=function(ev,obj){
    var This=this;     
    if(ev.which==1 && obj.className !='flag'){  
        //点击的是左键
        // console.log(obj);
        var curSquar= this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero','one','two','three','four','five','six','seven','eight'];
        if(curSquar.type=='number'){
               //用户点到的是数字
               obj.innerHTML=curSquar.value;
               obj.className =cl[curSquar.value];
               if(curSquar.value==0){
                  /*用户点到数字0 
                  递归处理0的扩散
                   1显示自己
                     2找四周
                     显示四周，不为0停止*/


                  obj.innerHTML=''; //数字为0不显示

                  function getAllzero(square){
                      var around=This.getAround(square);
                       for(var i=0;i<around.length;i++){
                           var x =around[i][0]; //行
                           var y =around[i][1]; //列

                           This.tds[x][y].className= cl[This.squares[x][y].value];
                            
                           if(This.squares[x][y].value==0){
                               //如果以某个格子为中心找到的格子值为0，那就接着调用递归函数
                               if(!This.tds[x][y].check){
                                    //给td添加一个属性，用于决定此格子是否被找过，找过为true,这样不会浪费资源。
                                This.tds[x][y].check = true;
                                getAllzero(This.squares[x][y]);
                               }
                            }else{
                                This.tds[x][y].innerHTML= This.squares[x][y].value;
                            }
                       }
                  }
                  getAllzero(curSquar);
               }
        }else{
            //用户点到的是雷
            this.gameOver(obj);
        }
        // console.log(curSquar);
    }
    //右击鼠标
  if(ev.which==3){
        //如果右击的是数字不能点击 
        if(obj.className && obj.className !='flag'){
            return;  
        } 
        obj.className=obj.className == 'flag'?' ':'flag';
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
            this.allRight = true;  //用户标的小红旗全是雷
        }else{
            this.allRight =false;
        }

        if(obj.className == 'flag'){
            this.mineNumDom.innerHTML=--this.surplusMine;
        }else{
            this.mineNumDom.innerHTML=++this.surplusMine;
        }
        if(this.surplusMine == 0){
              //剩余雷数为0；表示标完红旗
            if(this.allRight){
                //这个条件成立说明用户全标对
                alert('恭喜你！游戏通过');
            }else{
                alert('游戏失败');
                this.gameOver();
            }
        }
  }
    
};
 ///游戏失败函数
 Mine.prototype.gameOver=function(clickTd){
    /* 1、显示所有雷
     2、取消所有格子的点击事件
     3、给点中的那个雷标上一个红
     */
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
            }

            this.tds[i][j].onmousedown =null;
        }
    }
    if(clickTd){
      clickTd.style.backgroundColor='red'
    }
 }
// 上边button的功能
var btns = document.querySelectorAll('.level button');
var mine = null;   //用于存储生成的实例
var ln = 0;        //用于处理当前选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]]; //不同级别的行数列数雷数

for(let i=0; i<btns.length-1;i++){
    btns[i].onclick = function(){
        btns[ln].className = '';
        this.className = 'active';

        mine=new Mine(...arr[i]);
        mine.init();

        ln = i;
    }

}
btns[0].onclick();  //初始化一下
btns[3].onclick = function(){   //重新开始按钮
    mine.init();
}
