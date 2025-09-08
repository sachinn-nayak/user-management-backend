import express from 'express';
import db from '../db.js';
const router=express.Router()

router.post('/create',async (req,res)=>{
    const {name,description}=req.body;
    if(!name){
        return res.status(400).json({error:'Name is required'})
    }   
    try{
        const result=await db.query(
            'INSERT INTO categories (name,description) VALUES ($1,$2) RETURNING id,name,description',
            [name,description]
        );
        res.status(201).json({message:'Category created successfully',category:result.rows[0]});
    }catch(err){
        if(err.code==='23505'){
            return res.status(400).json({error:'Category name already exists'});
        }       
        console.error(err);
        res.status(500).json({error:'Database error'});
    }   
});

router.get('',async (req,res)=>{
    try{
        const {rows}=await db.query('SELECT id,name,description FROM categories ORDER BY id');
        res.json(rows);
    }catch(err){
        console.error(err);
        res.status(500).json({error:'Database error'});
    }   
});
export default router;