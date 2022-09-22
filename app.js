require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { response } = require('express')

const app = express()

//Config JSON response
app.use(express.json())

//Models
const User = require('./models/User')
const { create } = require('./models/User')

//Register User
app.post('/auth/register/', async(req, res)=> {
    const {name, email, password, passwordConfirm, weight, height, birthDate} = req.body
    
    //validations
    if(!name)
    return res.status(422).json({msg: `O campo Nome é obrigatório!`})

    if(!email)
    return res.status(422).json({msg: `O campo E-mail é obrigatório!`})

    if(!password)
    return res.status(422).json({msg: `O campo Senha é obrigatório!`})

    if(!weight)
    return res.status(422).json({msg: `O campo Peso é obrigatório!`})

    if(!height)
    return res.status(422).json({msg: `O campo Altura é obrigatório!`})

    if(!birthDate)
    return res.status(422).json({msg: `O campo Data de nascimento é obrigatório!`})

    if(password > 8 && password < 20) 
    return res.status(422).json({msg: `A senha precisa ter de 8 a 20 caracteres!`})

    if(password !== passwordConfirm)
    return res.status(422).json({msg: `Senhas diferentes, por favor tente novamente!`})

    const userExists = await User.findOne({email: email})
    if(userExists) 
    return res.status(422).json({msg: `Por favor, utilize outro e-mail!`})

    //Create password
    const salt =  await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Create user
    const user = new User({
        name: name,
        email: email,
        password: passwordHash,
        weight: weight,
        height: height,
        birthDate: birthDate
    })

    try {
        await user.save()
        res.status(201).json({msg: `Usuário criado com sucesso!`});
    } catch(e) {
        return res.status(500).json({msg: `Ocorreu um erro, por favor, tente novamente mais tarde!`})
    }
})

//Login User
app.post('/auth/login', async (req, res) => {
    const {email, password} = req.body

    //validations
    if(!email)
    return res.status(422).json({msg: `O campo E-mail é obrigatório!`})
    if(!password)
    return res.status(422).json({msg: `O campo Senha é obrigatório!`})

    //check if user is existing
    const user = await User.findOne({email: email})

    if(!user) 
    return res.status(404).json({msg: `Usuário não encontrado!`})

    //check if password is match
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword)
    return res.status(422).json({msg: `Senha inválida!`})

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
        }, secret)

        res.status(200).json({msg: `Autenticação realizada com sucesso!`, token})
    } catch(e) {
        return res.status(500).json({msg: `Ocorreu um erro, por favor, tente novamente mais tarde!`})
    }
})

//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

//Connection to server
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@nutridash.7amvasu.mongodb.net/users?retryWrites=true&w=majority`)
.then(() => {
        app.listen(3000)
        console.log('conectou ao banco')
    }
)
.catch((err) => 
    console.log(err)
)
