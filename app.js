//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// ---------------- Mongoose server starting ----------------------
mongoose.connect("mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.egujj.mongodb.net/todolistDB",{useNewUrlParser:true})

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
  name: "Baked Food"
});
const item2 = new Item({
  name: "Fried Food"
});
const item3 = new Item({
  name: "Tasty Food"
});

const defaultItems =  [item1,item2,item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};


const List =  mongoose.model("List",listSchema)
// Item.deleteMany(function(){
//   console.log("successfully deleted all the items")
// })




app.get("/", function(req, res) {

// const day = date.getDate();


Item.find({},function(err,foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("success");
      }
    });
    res.redirect("/");
  }
  else{
    // console.log(foundItems);
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    // console.log(fruits);
  }
});

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
    if(!foundList){
      // console.log("It not already exsits");
      const list = new List({
        name: customListName,
        items:defaultItems
      });
    list.save();
    res.redirect("/"+customListName);
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      // console.log("It already exsits");

    }
  }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  // console.log(listName)

  const item = new Item({
    name: itemName
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/")
    
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;

  // First Method to delete Items
/*  Item.deleteOne({_id: checkedItemId},function(err){
    // console.log("succesfully deleted")
    res.redirect("/")
}); */
if(listName == "Today"){

  //second method to delete items is by id 
  Item.findByIdAndRemove(checkedItemId,function(err){
    // console.log("succesfully deleted")
    if(!err){
    res.redirect("/"+listName);
    }
  });
}
else{
  List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}}, function(err,foundList){
    if (!err) {
      res.redirect("/"+listName);
    } else {
      
    }
  });
}


});


app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
