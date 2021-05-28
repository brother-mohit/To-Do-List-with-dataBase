const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
// let items = ["DSA for 2 hours","Web D for 4 hours","CS fundamentals for 2 hours", "Meditation"];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://brother_mohit:Brother@8447@cluster0.ijgsl.mongodb.net/todoListDB?retryWrites=true&w=majority",{useNewUrlParser : true, useUnifiedTopology: true});

  const itemSchema  = new mongoose.Schema({

        item : String
  });

   const Item = mongoose.model("Item", itemSchema);


   const dsa = new Item({
      item : "Welcome to your ToDo List"
   });

   const webd = new Item({
      item : "Click + to add new item"
   });

   const core = new Item({
      item : "Click the checkbox to remove an item"
   });


 const listSchema = new mongoose.Schema({
      name : String,
      list : [itemSchema]
 });

  const List = mongoose.model("List", listSchema);



const defaultItems= [dsa,webd,core];


app.get("/", function(req, res) {

   Item.find({},function(err,items){

      if(items.length==0)
       {
          Item.insertMany(defaultItems,function(err){

          });
          res.redirect("/");
       }
       else {

         res.render('list', {
           dayname: "Today",
           newitems: items
         });
       }

    });
 });

 app.get("/:customListName",function(req,res){

    const customListName =_.capitalize(req.params.customListName);

      List.findOne({name: customListName},function(err,customlist){

             if(!err)
             {
                   if(!customlist)
                    {

                        // create new custom list

                             const  list = new List({
                               name : customListName,
                               list : defaultItems
                             });

                            list.save();
                         res.redirect("/"+customListName);

                    }
                    else
                    {

                    res.render('list',{ dayname: customListName,  newitems: customlist.list });

                    }


             }

      });


 });

app.post("/", function(req, res) {

  let newitem = req.body.item;
  let listName= req.body.listName;

  //console.log(req.body.item);
   const item = new Item({
     item : newitem
   });

    if(listName=="Today")
     {
        item.save();
         res.redirect("/");
     }
   else
   {
   List.findOne({name: listName}, function(err,foundList){

          foundList.list.push(item);
          foundList.save();
           res.redirect("/"+listName);


   });
 }

});

app.post("/delete",function(req,res){
    const del_id= req.body.checkbox;
     const listName = req.body.listName;

     if(listName=="Today")
  {
     Item.deleteOne({_id : del_id}, function(err){
     if(err)
      {
        console.log(err);
      }
      else console.log("Deleted Succesfully !!");
    });
    res.redirect("/");
  }
else
{
   List.findOneAndUpdate({name : listName}, { $pull : {list : {_id : del_id }}}, function(err, updatedList){

        if(!err)
         {
            res.redirect("/"+listName);
         }
   });
}


});

app.listen(3000, function() {

  console.log("Server started on port 3000");
})
