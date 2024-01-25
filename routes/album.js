const album = require('../models/album');
const picture = require('../models/picture')
const users= require('../models/user');

var express = require('express');
var router = express.Router();

const authorize = require('../authentification/authenticator').authorize;
const admin = require('../authentification/authenticator').admin;


router.get('/', authorize,function(req, res,next) {
    album.findAll({
        order : [['id', 'ASC']]
    }) //la mw te jwenn yon problem paske te pran kek atribute specific epi m pat select id ladann ki te vinn fe chack tanm mete id an nan link lan li pat janm ka mache kounya li bon
        //!!!  sonje le m ap itilize yon id pou w fe tout select la
        .then(result => {

            if(!album){
                res.status(404);
            }
            res.render('getAlbum', {req : req,  album : result});
        })
        .catch(err =>  console.log(err))
})



router.get('/:albumName/getAllPicture/', authorize,function (req, res,next){
    const AlbumName = req.params.albumName;
    //fok mw eseye avek non paske l ap pi bon pou mw si m fe avek non an l ap pemet user a antre non album nan ki ap pi bon olye de antre non id an
    album.findAll({
        where : {
            albumName :  AlbumName
        },
        include : [{
            model : picture,
            order : [['id', 'ASC']]
        }]

    })
        .then(result => {
            if(!picture){
                res.status(404);
            }
            res.render('getAllPicture',{req : req,  album : result});
        })
        .catch(err =>  console.log(err))
})

router.get('/:albumName/addNewPic/', admin, function(req, res,next){
    res.render('addForm/addPicture');

})
router.post('/:albumName/addNewPic/', admin,  function(req, res,next){
    const newPictureAddress = req.body.Address;
    const newPictureName = req.body.PictureName;
    const albumName = req.params.albumName;
  album.findOne({
      attributes : ['id'],
      where: {
          albumName: albumName
      }
  }).then( Album => {
    if(!album){
        res.status(404);
    }
       picture.create({
          Address : newPictureAddress,
          PictureName : newPictureName,
          albumId :   Album.id,
           userId : req.user.id, // I just used the userId from the database that would be the id for the user session
          include :album

      })

  }).then(result => {
            if(!picture){
                res.status(404);
            }
            res.redirect('/album/'+ albumName +'/getAllPicture/')
        })
        .catch(err => console.log(err))


})



router.get('/createNewAlbum',admin, function(req, res,next) {
  res.render('addForm/addAlbum')
})

router.post('/createNewAlbum', admin,function(req, res,next) {
    const newAlbumName = req.body.albumName;

    const newAlbumAddress = req.body.Address;
    album.create({
        albumName : newAlbumName,
        Address : newAlbumAddress,
        userId : req.user.id

    })
        .then(result => {
            if(!album){
                 res.status(404);

            }
            console.log(result);

            res.redirect('/album');
        })
        .catch(err =>  console.log(err))
})
    //Pou update lan mw ap montre foto a nan fom lan epi input lan ap jis adress lan
router.get('/updateAlbum/:id', admin, function(req, res, next){
    album.findByPk(req.params.id)
        .then(result => {
            if(!album){
                 res.status(404);
            }
            res.render('updateForm/updateAlbum', { album : result });
        })
        .catch(err => console.log(err));
})
router.post('/updateAlbum/:id',  admin,function(req, res,next) {
    const albumId = req.params.id;
    const newAlbumName = req.body.albumName;
    const newAlbumAddress = req.body.Address;
    album.update({
            albumName : newAlbumName,
          Address : newAlbumAddress

        },
        {
            where : {
                id : albumId
            }

    })
        .then(result => {
            if(!album){
                res.status(404);

            }
            console.log(result);

            res.redirect('/album');
        })
        .catch(err =>  console.log(err))
})
//Mw jwen yon bel ide olye mw itilize plizye ejs ki pral pemet mw al nan fe yon ekip kod mw jis itilize  function an nan ejs epi li mache korekteman

router.get('/:albumName/updatePicture/:id',  admin,function(req, res,next){
    picture.findByPk(req.params.id)
        .then(result => {
            if(!picture){
                 res.status(404);
            }
            res.render('updateForm/updatePicture', { picture : result });
        })
        .catch(err => console.log(err));
})
router.post('/:albumName/updatePicture/:id', admin, function(req, res, next) {
    const pictureId = req.params.id;
    const newPictureAddress = req.body.Address;
    const newPictureName = req.body.PictureName;
    const albumName = req.params.albumName;

    picture.update(
        {
            Address: newPictureAddress,
            PictureName: newPictureName
        },
        {
            where: {
                id: pictureId
            },
            include: [
                {
                    model: album,
                    where: {
                        albumName: albumName
                    }
                }
            ]
        }
    )
        .then(result => {
            if (!picture) {
                return res.status(404);
            }

            res.redirect('/album/'+ albumName + '/getAllPicture/');
        })
        .catch(err => {
            console.log(err);
        });
});

/*
M anvi tchke kantite foto ki genyen nan yon album e montre kantite a
*/
router.get('/:albumName/getAllPicture/:id', admin, function(req, res,next){
picture.destroy({
        where : {
            id : req.params.id
        }
    }).then(result => {
            if(!picture){
               return  res.status(404);
            }
            console.log(result);

        res.redirect('/album/'+req.params.albumName+ '/getAllPicture/')

    }).catch(err => console.log(err));

})
router.get('/:id', admin,function(req, res,next){
    album.destroy({
        where : {
            id : req.params.id
        }
    })
        .then(result => {
            if(!album){
               return res.status(404);
            }
            console.log(result);

            res.redirect('/album');
        })
        .catch(err => console.log(err));
})


module.exports = router;