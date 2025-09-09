import express from 'express';
import db from '../db.js'

const router =express.Router()

router.post('/upload',async (req,res)=>{
    const {product_id,image_url}=req.body;
    if(!product_id || !image_url){
        return res.status(400).json({error:'product_id and image_url are required'});
    }
    try{
        const result=await db.query(
            'INSERT INTO product_images (product_id,image_url) VALUES ($1,$2) RETURNING id,product_id,image_url',
            [product_id,image_url]
        );
        res.status(201).json({message:'Image uploaded successfully',image:result.rows[0]});
    }catch(err){
        if(err.code==='23503'){
            return res.status(400).json({error:`Product with Id ${product_id} does not exist`});
        }   
        console.error(err);
        
        res.status(500).json({error:'Database error'});
    }
});

export default router;