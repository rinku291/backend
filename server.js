const http = require('http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const UserModel = require('./Model/Users');
const ProfileModel = require('./Model/ProfileModel');
const CatModel = require('./Model/CatModel');
const SubCatModel = require('./Model/SubCatModel');
const ProductModel = require('./Model/ProductModel');
const CartModel = require('./Model/CartModel');
const OrderModel = require('./Model/OrderModel');
const { generateJWT, verifyJWT } = require('./Service/Auth');
const PORT = 5001;
const HOST = '127.0.0.1';
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/MeeshoDb');

const db = mongoose.connection;

db.on("open", () => { console.log('Mongodb Connection Established') });


//Crearting SMTP connection with the brevo
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 465,
    secure: true,
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: "tsg.crsce1@gmail.com",
        pass: "71UOfP53gtsD0haj",
    },
});



app.get('/', (req, res) => { res.json('api working'); });



// This is for SignUp request -- working
app.post('/SignUp', async (req, res) => {

    const exist = await UserModel.findOne({ email: req.body.email });

    if (exist) {
        return res.json({ status: false, msg: 'Email Id Already Exist' });
    }
    const client = require('twilio')("AC692219a0ca134cffb7f50c58565d7918", "862526127b3b9f7253ff060c31e29684");

    OTP=Math.floor((Math.random()*1000000)+1);


    client.messages
          .create({
             from: '+19543200690',
             body: 'Your mobile OTP is ' + OTP,
             to: '+91'+req.body.mobile
           })
          .then(message => console.log(message.body))
    req.body.OTP=OTP;
    const user = new UserModel(req.body);
    user.save();

    //This is added to send email when user registration is done
    const info = await transporter.sendMail({
        from: '"admin@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: "Hello ✔ Regsiter success", // Subject line
        html: "<b>Welcome to our service</b>", // html body
    });

    const signup = await UserModel.findOne({
        email: req.body.email,
        password: req.body.password
    });


    const verify_otp = generateJWT(signup);

    return res.json({ status: true, msg: "Congrats Registered Successfully",verify_otp });

});

//Verify Mobile during SignUp
app.post('/Verify_OTP', verifyJWT, async (req,res) =>
{
    console.log(req.user.email,req.user.OTP);
    const find = await UserModel.findOne({email:req.user.email,OTP:req.user.OTP})
    

    if(find)
    {
        const update = await UserModel.findOneAndUpdate({email:req.user.email,OTP:req.user.OTP},{OTP:null,status:1})
        console.log(find);
        console.log(update);
        return res.json({status:true,msg:'Mobile is Valid'});
    }
    else
    {
        return res.json({status:false,msg:'Mobile Number Is Invalid'});
    }
})

// This is for SignIn request 
app.post('/SignIn', async (req, res) => {
    const login = await UserModel.findOne({
        email: req.body.email,
        password: req.body.password,
        status:1
    });

    console.log(login);

    if (!login) {
        return res.json({ status: false, msg: 'Login Denied' });
    }

    const info = await transporter.sendMail({
        from: '"admin@gmail.com', // sender address
        to: req.body.email, // list of receivers
        subject: "Hello ✔ Login success", // Subject line
        html: "<b>You are Logged in successfully</b>", // html body
    })

    const token = generateJWT(login);

    return res.json({ status: true, msg: 'Logged in Successfuly', token, login });



});

//Extract profile for a user
app.get('/userprofile', verifyJWT, async (req, res) => {

    
    const userdata = await UserModel.findOne({
        OTP: req.user.OTP
    });

    console.log(req.user.OTP)


    if (userdata) {
        return res.json({ status: true, msg: 'Successful', userdata });
    }
    else {
        return res.json({ status: false, msg: 'Request Denied' });
    }
});

//Adding Profile Info for a User in Profiles Table

app.post('/profile_infoadd', verifyJWT, async (req, res) => {
    req.body.user_id = req.user._id;
    const profilecheck = await ProfileModel.findOne({ user_id: req.body.user_id });
    if (profilecheck) {
        console.log('Profile being updated', profilecheck);
        const profileupdate = await ProfileModel.findOneAndUpdate({ 'user_id': req.user._id }, {
            fname: req.body.fname,
            lname: req.body.lname,
            gender: req.body.gender,
            email: req.body.email,
            mobile: req.body.mobile
        }, { upsert: true });

        const info = await transporter.sendMail({
            from: '"admin@gmail.com', // sender address
            to: req.user.email, // list of receivers
            subject: "Personal Info Updation", // Subject line
            html: "<p>Dear " + req.user.user + ",<br><br>Your Personal Info has been updated.<br><br> Please confirm that it is you. In case not please check your account immediately.", // html body
        });

        return res.json({ msg: 'Profile being updated' });
    }
    else {
        console.log('New Profile being created', profilecheck);
        const profile = new ProfileModel(req.body);
        profile.save();
        return res.json({ msg: 'New Profile being created' });

    }

});

//Adding Pancard Info for a User in Profiles Table
app.post('/pancardupdate', verifyJWT, async (req, res) => {
    req.body.user_id = req.user._id;

    console.log(req.body.user_id);
    console.log(req.body.pancard);
    const response = await ProfileModel.findOneAndUpdate({ 'user_id': req.user._id }, { pancard: req.body.pancard });
    if (response) {
        const info = await transporter.sendMail({
            from: '"admin@gmail.com', // sender address
            to: req.user.email, // list of receivers
            subject: "Pancard Info Updation", // Subject line
            html: "<p>Dear " + req.user.user + ",<br><br>Your Pancard Info has been updated.<br><br> Please confirm that it is you. In case not please check your account immediately.", // html body
        });
        console.log('Pancard Updated', response);
        return res.json({msg:"Pancard Updated"})
    }
});

//Adding Address Info for a User in Profiles Table
app.post('/addressupdate', verifyJWT, async (req, res) => {
    req.body.user_id = req.user._id;
    console.log(req.body.address);
    const response = await ProfileModel.findOneAndUpdate({ 'user_id': req.user._id }, {
        name_add: req.body.name_add,
        mobile_add: req.body.mobile_add,
        pincode: req.body.pincode,
        locality: req.body.locality,
        area_street: req.body.area_street,
        state: req.body.state,
        landmark: req.body.landmark,
        alt_phone: req.body.alt_phone,
        address_type: req.body.address_type
    });
    if (response) {
        const info = await transporter.sendMail({
            from: '"admin@gmail.com', // sender address
            to: req.user.email, // list of receivers
            subject: "Address Details Updation", // Subject line
            html: "<p>Dear " + req.user.user + ",<br><br>Your Address deatils has been updated.<br><br> Please confirm that it is you. In case not please check your account immediately.", // html body
        });
        console.log('Address Updated', response);
    }
});


app.get('/profileinfofetch', verifyJWT, async (req, res) => {

    const profile = await ProfileModel.find({ user_id: req.user._id });
    if (profile) {
        return res.json({ status: true, msg: 'Success', profile })
    }
});









//----------------Testing Stop-------------------------------------

//Add New categories into the Database -- working
app.post('/Catadd', async (req, res) => {
    const catadd = new CatModel(req.body);
    catadd.save();
    return res.json({ status: true, msg: "Category added successfuly" });
});

//Add New categories into the Database -- working
app.post('/subcatadd', async (req, res) => {
    const catadd = new SubCatModel(req.body);
    catadd.save();
    return res.json({ status: true, msg: "Category added successfuly" });
});


//Add New Products into the Database -- working
app.post('/ProAdd', async (req, res) => {
    const proadd = new ProductModel(req.body);
    proadd.save();
    return res.json({ status: true, msg: 'Product Added Succefully' });


});

//Extract categories from Database in header section
app.get('/catfetch', async (req, res) => {
    const catall = await CatModel.find({ parent_id: null, header_value: true });
    return res.json({ status: true, msg: "Successful", catall });
});

//Extract sub categories from Database in header section
app.post('/subcatfetch', async (req, res) => {
    const catall = await CatModel.find({ parent_id: req.body.parent_id });
    return res.json({ status: true, msg: "Successful", catall });
});


app.get('/home_cat', async (req, res) => {
    var element = await CatModel.find({ header_value: false });
    var finaldata = [];

    var subfinaldata = [];
    for (i = 0; i < element.length; i++) {

        var subcat = await SubCatModel.find({ subcat_id: element[i].parent_id });
        var subcatfinal = subcat.filter(e => e.subcat_id = element[i].parent_id);
        element[i].sub_cat = subcatfinal;
        console.log(element[i].subcat);

        finaldata.push(element[i]);
        subfinaldata.push(element[i].sub_cat);
    }
    return res.json({ status: true, msg: "Successful", categories: finaldata, subcat: subfinaldata });
});




app.post('/home_cat_sub', async (req, res) => {
    const catall = await ProductModel.find({ category_id: req.body.cat_id });
    return res.json({ status: true, msg: "Successful", categories: catall });
});


//Extract products for header subcategory
app.post('/GetProducts', async (req, res) => {
    const products = await ProductModel.find({ category_id: req.body.category_id });

    if (products) {
        return res.json({ status: true, msg: 'Success', products });
    }
    else {
        return res.json({ status: false, msg: 'Something went wrong' });
    }

});



//Extract all products in Home Page
// app.get('/ProAll', async (req, res) => {
//     const products = await ProModel.find({});
//     return res.json({ status: true, msg: 'Successful', products });
// });

//Extract Subcategory wise products at Home Page
app.post('/subcat_products_home/:category_id', async (req, res) => {
    console.log(req.body.min_price,req.body.max_price,req.body.star_rating,req.params.category_id);

 
       var products = await ProductModel.find({
            category_id: req.params.category_id, price:{ $gte: req.body.min_price, $lte: req.body.max_price},star_rating:{$gte: req.body.star_rating}
        })



    if (products) {
        return res.json({ status: true, msg: 'successful', products });
    }
    else {
        return res.json({ status: false, msg: 'Request Failed' });
    }
});

//Extract Single Product Details
app.post('/SingleProductFetch', async (req, res) => {
    const product = await ProductModel.findOne({
        _id: req.body.product_id
    });

    if (product) {
        return res.json({ status: true, msg: 'successful', product })
    }
});

//Add to Cart Table from product page
app.post('/addtocart', verifyJWT, async (req, res) => {
    user_id = req.user._id;
    const cartadd = new CartModel({
        product_id: req.body.productid,
        count: req.body.count,
        user_id: user_id,
        status: true
    });
    cartadd.save();

    if (cartadd) {
        return res.json({ status: true, msg: 'Added to Cart' });
    }
    else {
        return res.json({ status: false, msg: 'Error' });
    }
});

//Showcart Items from Cart table
app.get('/showcart_items', verifyJWT, async (req, res) => {
    cart_items = await CartModel.find({ user_id: req.user._id }).populate('product_id');


    if (cart_items) {
        //return res.json({status:true,msg:'successful',cart_items,initial_price,total_discount,final_price});
        return res.json({ status: true, msg: 'successful', cart_items });
    }
    else {
        return res.json({ status: false, msg: 'no items found' });
    }


});

//Save Order Details

app.post('/Order_Details', verifyJWT, async (req, res) => {
    req.body.user_id = req.user._id;

    const order = new OrderModel(req.body);

    order.save();
    console.log(order);
    return res.json({ status: true, msg: 'Success' });

});

//Send Email after Order Success

app.post('/Send_Product_Email', verifyJWT, async (req, res) => {

    console.log(req.body.mail_data);
    content = req.body.mail_data;
    //total_price = req.body.tot_price;
    
    var data = "";
        //   data +=  "<h3>"+element.title+"</h3>";
        //   data +=  "<p>"+element.description+"</p>";
        //   data +=  "<h3>"+'Product Features'+"</h3>";
        //   data +=  "<h3>"+element.features+"</h3>";
        //   data +=  "<h3>"+'Item Count'+"</h3>";
        //   data +=  "<h3>"+element.item_count+"</h3>";
        //   data +=  "<h3>"+'Purchase Date'+"</h3>";
        //   data +=  "<h3>"+element.purchase_date+"</h3>";


        
        data += `<!DOCTYPE html>
        <html><body style="background-color:rgb(244, 248, 248)">
        <table align="center"  style="box-shadow: 7px 7px 3px #888;" border="0" margin-left='50px' msrgin-right='50px' cellpadding="0" cellspacing="0" width="950"
            bgcolor="white">`;
            content.forEach(element => {
            data +=`<tr><td>
                    <img height="400px" width="300px" style="margin:20px;box-shadow: 5px 5px 2px #888;" src="`+element.image+`"></img>
                </td>
                <td>
                    <h3 style="padding-bottom:10px;text-shadow: 1px 1px 1px #888;">`+element.title+`</h3>                
                    <h4 style="font-size:medium">Product Features:</h4>
                    <p style="font-size:10pt;">`+element.description+`</p>
                    <p style="font-size:10pt">`+element.features+`</p>
            <h4 style="font-size:medium">Item Count: `+element.item_count+`</h4>
                    <h3 style="padding-bottom:;font-size:medium;color: rgb(38, 139, 38);">Tot Price   ₹`+element.tot_price+`</h3>
                </td></tr>`;
            });
           data += `</table><h3>Thanks for shoping with us</body></html>`;
   
    
    console.log(data);

    const info = await transporter.sendMail({
        from: '"admin@gmail.com', // sender address
        to: req.user.email, // list of receivers
        subject: "Thanks for shoping with Flipkart", // Subject line
        html: data, // html body
    })

    if (data)
    {
        return res.json({msg:"Mail Successfully Sent"});
    }

});

// Fetch Order Details
app.get('/fetch_order_details', verifyJWT, async (req, res) => {
    const orders = await OrderModel.find({ user_id: req.user._id });
    console.log(req.user._id);

    if (orders) {
        return res.json({ status: true, msg: 'success', orders });
    }
})

app.post('/fetch_product_details', async (req, res) => {
    const product = await ProModel.findOne({ _id: req.body.id });

    console.log(product);

    if (product) {
        return res.json({ status: true, msg: 'success', product });
    }
})

app.post('/delete_all_cart_items', verifyJWT, async (req, res) => {
    userid = req.user._id
    const find = await CartModel.find({ user_id: userid });
    if (find != 0) {
        const del = await CartModel.deleteMany({ user_id: userid });
        return res.json({ msg: 'Deleted Successfully' });
    }
    else {
        return res.json({ msg: 'Cart items not found' });
    }
})

app.post('/update_instock_count', async (req, res) => {
    console.log(req.body.productid, req.body.instock, req.body.quantitysold);
    const update_products = await ProductModel.findOneAndUpdate({ _id: req.body.productid }, {
        in_stock: req.body.instock, quantity_sold: req.body.quantitysold
    })
    if (update_products) {
        return res.json({ status: true, msg: 'success' });
    }
});



// app.post('/UpdatePaymentId', verifyJWT, async (req,res) =>
// {
//     id=req.user_.id;
// const update = await OrderModel.findOneAndUpdate({user_id:id}, {payment_id:req.body.payment_id})
// console.log(update);
// });



//Remove from cart

app.post('/deletefromcart', async (req, res) => {
    const del = await CartModel.deleteOne({ _id: req.body.id });
    console.log(del);

    if (del) {
        return res.json({ status: true, msg: 'Deleted from Cart' });
    }
    else {
        return res.json({ status: false, msg: 'Unsuccessful' })
    }

});

//Update Cart Item  Increment/Decrement

app.post('/Updatecart', async (req, res) => {
    const del = await CartModel.findOneAndUpdate({ _id: req.body.id }, { count: req.body.count });
    console.log(del);

    if (del) {
        return res.json({ status: true, msg: 'Count Updated' });
    }
    else {
        return res.json({ status: false, msg: 'Unsuccessful' })
    }

});

//Extracts category wise products in category page
app.get('/Cat-Products/:category_id', async (req, res) => {
    const catproducts = await ProModel.find({
        category_id: req.params.category_id

    });

    if (catproducts) {
        return res.json({ status: true, msg: 'successful', catproducts });
    }
    else {
        return res.json({ status: false, msg: 'successful' });
    }
});

//Extract Single product on product page
app.get('/singlepro/:product_id', async (req, res) => {
    const product = await ProModel.findOne({
        _id: req.params.product_id
    });

    if (product) {
        return res.json({ status: true, msg: 'successful', product });
    }
    else {
        return res.json({ status: false, msg: 'Unsuccessful' });
    }
});
















app.listen(PORT, HOST, () => { console.log('Server is working now'); });






