'use strict'

import CategoryRoom from './categoryRoom.model.js' 
import {checkUpdateCategory} from '../utils/validator.js'
import Hotel from '../hotel/hotel.model.js'

export const addCategoryRoomStandar = async (req, res) =>{
    try {
        let  categoryExist = await CategoryRoom.findOne({nameCategoryRoom: 'Standar'})
        if (!categoryExist) {
            let newCategory = new CategoryRoom({
                nameCategoryRoom: 'Standar',
                descriptionCategoryRoom: 'Standar category Room',
              });
            let category = new CategoryRoom(newCategory)
            await category.save()
            console.log('Category Standar register correctly');
            } else {
            console.log('Alredy exist Category Standar Room.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Room')   
    }
}
export const addCategoryRoomSuite = async (req, res) =>{
    try {
        let  categoryExist = await CategoryRoom.findOne({nameCategoryRoom: 'Suite'})
        if (!categoryExist) {
            let newCategory = new CategoryRoom({
                nameCategoryRoom: 'Suite',
                descriptionCategoryRoom: 'Suite category Room',
              });
            let category = new CategoryRoom(newCategory)
            await category.save()
            console.log('Category Suite register correctly');
            } else {
            console.log('Alredy exist Category Suite Room.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Room')   
    }
}

export const addCategoryRoomBasic = async (req, res) =>{
    try {
        let  categoryExist = await CategoryRoom.findOne({nameCategoryRoom: 'Basic'})
        if (!categoryExist) {
            let newCategory = new CategoryRoom({
                nameCategoryRoom: 'Basic',
                descriptionCategoryRoom: 'Basic category Room',
              });
            let category = new CategoryRoom(newCategory)
            await category.save()
            console.log('Category Basic register correctly');
            } else {
            console.log('Alredy exist Category Basic Room.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Room')   
    }
}

export const addCategoriesRoomDefault = async(req, res) =>{
    try{
        await addCategoryRoomBasic()
        await addCategoryRoomStandar()
        await addCategoryRoomSuite()
    } catch (error) {
        console.error(error)
        console.log('faild add categories')
    }
}

export const addCategoryRoom = async (req, res) =>{
    try {
        let data = req.body
        let categoryR = new CategoryRoom(data)
        await categoryR.save()
        return res.send({message: `add successfully,${categoryR.nameCategoryRoom} was registered`})
    } catch (error) {
        console.error(error)
        if(error.keyValue.nameCategoryRoom) return res.status(400).send({message: `Category Room ${error.keyValue.nameCategoryRoom} is alredy taken ` })
        return res.status(500).send({message: 'Failed add Category Room', error: error})
    }
}

export const getCategoryRoom = async(req, res)=>{
    try {
        let category = await CategoryRoom.find()
        if(!category) return res.status(404).send({message: 'Category Room not found'})
        return res.send({ category})
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error listing category Room', error: error })
    }
}

export const updateCategoryRoom = async(req, res)=>{
    try {
        let {id} = req.params
        let data = req.body
        let update = await checkUpdateCategory(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update or missing data'})
        let updateCategory = await CategoryRoom.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateCategory) return res.status(401).send({ message: 'Category Room not found' })
        return res.send({ message: 'Category Room update', updateCategory })
    } catch (error) {
        console.error(error)
        if(error.keyValue.nameCategoryRoom ) return res.status(400).send({message: `Category Room ${error.keyValue.nameCategoryRoom} is alredy taken ` })
        return res.status(500).send({ message: 'Error updating Category Room' })
        
    }
}

export const deleteCategoryRoom = async (req, res)=>{
    try {
        let{id} = req.params
        let categoryDefault = await CategoryRoom.findOne({nameCategoryRoom: 'Standar'})
        let idDefualt = categoryDefault._id
        let deleteCategory =  await CategoryRoom.findOneAndDelete({_id: id})
        if(!deleteCategory) return res.status(404).send({message: 'Category Room not found and not deleted'})
        //Actualizar el id del del room
        await Hotel.updateMany({ categoryHotel: id }, { $set: { categoryHotel: idDefualt } });
        return res.send({message: `Category Room ${deleteCategory.nameCategoryRoom} deleted successfully`})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting Category Room', error: error })
    }
}
