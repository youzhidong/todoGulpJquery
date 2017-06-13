;(function(){
    var $add_task=$(".add-task"),
        $task_list=$(".task-list");
        task_list=[]; //列表
    init();

    $add_task.on('submit',function(ev){
        ev.preventDefault(); //取消默认事件

        var obj={};
        obj.content=$add_task.find(".text").val();

        if(!obj.content) return;

        add_task_list(obj); //添加数据
        renew_html();
        $add_task.find(".text").val(null)


    });


    //初始化
    function init(){
        task_list=store.get("task") || [];
        renew_html();
   }

    //把数据推到浏览器
    function add_task_list(obj){
        task_list.push(obj);
        store.set('task',task_list) //把数据存进去

    }

    //更新html列表
    function renew_html(){
        $task_list.html(null);

        var is_complateArr=[];

        for(var i=0; i<task_list.length; i++)
        {
            if (task_list[i].complate)
            {
                is_complateArr[i]=task_list[i];
            }
            else
            {
                var $item =creat_html(i,task_list[i]);
                $task_list.append($item);
            }

        }
        //console.log(is_complateArr);
        for(var j=0; j<is_complateArr.length; j++)
        {
            var $item01=creat_html(j,is_complateArr[j]);

            $task_list.append($item01);
            if (!$item01) continue;
            $item01.addClass("unline")
        }


        var $delete=$(".delete.r-main");
        delete_event($delete); //删除事件
        deteal_event(); //详细事件
        is_complate();//选中事件

    }

    //生成html
    function creat_html(index,data){
        if ( !data) return;
        //console.log(data.complate);
        var str='<li data-index="'+index+'">'+
            '<input type="checkbox" '+(data.complate?"checked": '')+' class="complate">'+
            '<p class="content">'+data.content+'</p>'+
            '<div class="right">'+
            '<span class="delete r-main">删除</span>'+
            '<span class="deteal r-main">详细</span>'+
            '</div>'+
            '</li>'

        return $(str);
    }


    //删除事件
    function delete_event($delete){
        $delete.on("click",function () {
            var index=$(this).parent().parent().data("index")
            delete_alert(index); //弹框
        })
    }

    //显示弹框
    function delete_alert(index){
        $(".Alert").show();
        //var off=confirm("你确定删除么");
        //if (!off) return;
        $(".primary.confirm").bind('click',function(){
            //delete task_list[index]; //splice
            task_list.splice(index,1);
            $(".Alert").hide();
            delete_up_data();
            renew_html()
        });
        $(".cancel").click(function(){
            $(".Alert").hide();
        })

   }

   //更新数据
    function delete_up_data(){
        store.set("task",task_list)
    }
    


    //详细列表----------------------------------------

    function  deteal_event(){
        $(".deteal.r-main").on("click",function(){
            var index=$(this).parent().parent().data("index");
            var $item=deteal_creat_html(task_list[index]); //html
            $task_list.after($item); //生成html

            up_deteal_data(index); //详细列表 提交数据
            db_click(); //双击事件
            datetimepicker(); //日期插件


            $(".task-detail-mask,.colse").click(function(){
                $(".task-detail").remove(); //删除html
                $(this).remove();//删除html
            })
        });

    }

    //生成html
    function deteal_creat_html(data){
        var str='<div class="task-detail-mask"></div>'+
            '<div class="task-detail">'+
            '<form class="up-task">'+
            '<h2 class="content">'+data.content+'</h2>'+
            '<div class="input-item">'+
            '<input type="text" id="dbText">'+
            '</div>'+
            '<div class="input-item">'+
            '<textarea>'+(data.dsk || "") +'</textarea>'+
            '</div>'+
            '<div class="remind input-item">'+
            '<label for="b">提醒时间</label>'+
            '<input id="b" class="datetime"  type="text" value="'+(data.time || '')+'">'+
            '</div>'+
            '<div class="input-item">'+
            '<button>更新</button>'+
            '</div>'+
            '<div class="colse">X</div>'+
            '</form>'+
            '</div>';

        return $(str);
    }

    //双击事件
    function db_click(){
        $(".task-detail .up-task .content").dblclick(function () {
            var $dbText=$("#dbText");
            var $that=$(this);
            $that.hide();
            $dbText.show();
            $dbText.focus();

            $dbText.blur(function(){
                $dbText.hide();
                $that.show();
                if (!$dbText.val())
                    return
                else
                    $that.text($dbText.val())
            })


        })
    }

    //详细列表 提交数据
    function up_deteal_data(index){
        var $upTask=$(".task-detail .up-task");
        $upTask.on("submit",function(ev){
            ev.preventDefault();

            var newObj= {};
            newObj.content=$upTask.find(".content").text();
            newObj.dsk=$upTask.find(".input-item textarea").val();
            newObj.time=$upTask.find(".remind .datetime").val();

            up_data(newObj,index);

            time_remind(); //调用提醒
       })
    }

    function up_data(newObj,index){
        task_list[index] = $.extend({},task_list[index],newObj);

        store.set("task",task_list);
        renew_html(); //更新li
    }

    //选中事件
    function is_complate(){
        var $complate=$(".task-list .complate");
        $complate.on("click",function(){
            //在数据里面添加 complate
            //up_data({complate:})
            var index=$(this).parent().data("index");
            if (task_list[index].complate)
            {
                up_data({complate:false},index)
            }
            else
            {
                up_data({complate:true},index)
            }
       })
    }

    //日期插件
    function datetimepicker(){
        $.datetimepicker.setLocale('ch');//设置中文
        $('.datetime').datetimepicker({
            yearStart:2016,     //设置最小年份
            yearEnd:2018,        //设置最大年份
            //timepicker:false,    //关闭时间选项
        });
    }

    time_remind();//时间提醒
    //时间到了 提醒

    function time_remind(){
        //1.获取最新的时间  cur_time
        //2.获取结束时间    end_time
        // if(end_time - cur_time < 1)    要播放音乐了
        var timer=null;
        timer=setInterval(function(){

            var cur_time=new Date().getTime();


            for(var i=0; i<task_list.length; i++)
            {



                if(!task_list[i].time || task_list[i].complate || task_list[i].off) continue;
                var end_time=(new Date(task_list[i].time)).getTime();

                if (end_time - cur_time < 1)
                {
                    console.log(1);
                    //弹出提示框
                    show_msg(task_list[i].content);

                    up_data({off:true},i);
                    clearInterval(timer);
                    //播放music
                    play_music();

                }
            }
        },1000)
    }

    //播放music
    function play_music(){
        var music=document.querySelector("#music");
        music.play();
    }
    //弹出提示框
    function show_msg(content){
        $(".msg").show();
        $(".msg-content").text(content);
        $(".msg-btn").click(function () {
            $(".msg").hide();
        });
        time_remind();//时间提醒
    }


    //1.代码简介    不重复   有弹性

}());
