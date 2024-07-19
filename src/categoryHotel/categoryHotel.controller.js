'use strict'

import CategoryHotel from './categoryHotel.model.js' 
import {checkUpdateCategory} from '../utils/validator.js'
import Hotel from '../hotel/hotel.model.js'

export const addCategoryHotelDefault = async (req, res) =>{
    try {
        let  categoryExist = await CategoryHotel.findOne({nameCategoryHotel: 'Default'})
        if (!categoryExist) {
            let newCategory = new CategoryHotel({
                nameCategoryHotel: 'Default',
                descriptionCategoryHotel: 'Default category Hotel',
              });
            let category = new CategoryHotel(newCategory)
            await category.save()
            console.log('Category register correctly Hotel');
            } else {
            console.log('Alredy exist Category Hotel.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Hotel')
        
    }
}

export const addCategoryHotelPremium = async (req, res) =>{
    try {
        let  categoryExist = await CategoryHotel.findOne({nameCategoryHotel: 'Premium'})
        if (!categoryExist) {
            let newCategory = new CategoryHotel({
                nameCategoryHotel: 'Premium',
                descriptionCategoryHotel: 'Premium category Hotel',
              });
            let category = new CategoryHotel(newCategory)
            await category.save()
            console.log('Category Hotel Premium register correctly');
            } else {
            console.log('Alredy exist Category Premium Hotel.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Hotel')
        
    }
}

export const addCategoryHotelStandar = async (req, res) =>{
    try {
        let  categoryExist = await CategoryHotel.findOne({nameCategoryHotel: 'Standar'})
        if (!categoryExist) {
            let newCategory = new CategoryHotel({
                nameCategoryHotel: 'Standar',
                descriptionCategoryHotel: 'Standar category Hotel',
              });
            let category = new CategoryHotel(newCategory)
            await category.save()
            console.log('Category Hotel Standar register correctly ');
            } else {
            console.log('Alredy exist Category Standar Hotel.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Hotel')
        
    }
}

export const addCategoryHotelBasic = async (req, res) =>{
    try {
        let  categoryExist = await CategoryHotel.findOne({nameCategoryHotel: 'Basic'})
        if (!categoryExist) {
            let newCategory = new CategoryHotel({
                nameCategoryHotel: 'Basic',
                descriptionCategoryHotel: 'Basic category Hotel',
              });
            let category = new CategoryHotel(newCategory)
            await category.save()
            console.log('Category Hotel register Basic correctly ');
            } else {
            console.log('Alredy exist Category Basic Hotel.');
            }
    } catch (error) {
        console.error(error)
        console.log('Fail add Category Hotel')
        
    }
}

export const addDefaultCategoriesHotel = async (req, res) =>{
    try {
        await addCategoryHotelPremium()
        await addCategoryHotelStandar()
        await addCategoryHotelBasic()
    } catch (error) {
        console.error(error)
        console.log('faild add categories')
    }
}

export const addCategoryHotel = async (req, res) =>{
    try {
        let data = req.body
        let categoryH = new CategoryHotel(data)
        await categoryH.save()
        return res.send({message: `add successfully,${categoryH.nameCategoryHotel} was registered`})
    } catch (error) {
        console.error(error)
        if(error.keyValue.nameCategoryHotel) return res.status(400).send({message: `Category Hotel ${error.keyValue.nameCategoryHotel} is alredy taken ` })
        return res.status(500).send({message: 'Failed add Category Hotel', error: error})
    }
}

export const getCategoryHotel = async(req, res)=>{
    try {
        let categorieshotels = await CategoryHotel.find()
        if (!categorieshotels) return res.status(404).send({ message: 'Category Hotel not found' })
        return res.send({ categorieshotels })
        
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error listing category Hotel', error: error })
    }
}

export const updateCategoryHotel = async(req, res)=>{
    try {
        let {id} = req.params
        let data = req.body
        let update = await checkUpdateCategory(data, id)
        if(!update) return res.status(400).send({message: 'Have submitted some data that cannot be update or missing data'})
        let updateCategory = await CategoryHotel.findOneAndUpdate(
            { _id: id },
            data,
            {new: true} 
        )
        if (!updateCategory) return res.status(401).send({ message: 'Category Hotel not found' })
        return res.send({ message: 'Category Hotel update', updateCategory })
    } catch (error) {
        console.error(error)
        if(error.keyValue.nameCategoryHotel ) return res.status(400).send({message: `Name ${error.keyValue.nameCategoryHotel} is alredy taken ` })
        return res.status(500).send({ message: 'Error updating Category Hotel' })
        
    }
}

export const deleteCategoryHotel = async (req, res)=>{
    try {
        let{id} = req.params
        //Categoria por default
        let categoryDefault = await CategoryHotel.findOne({nameCategoryHotel: 'Default'})
        let idDefualt = categoryDefault._id
        let deleteCategory =  await CategoryHotel.findOneAndDelete({_id: id})
        if(!deleteCategory) return res.status(404).send({message: 'Category Hotel not found and not deleted'})
        //Actualizar el id del hotel
        await Hotel.updateMany({ categoryHotel: id }, { $set: { categoryHotel: idDefualt } });
        return res.send({message: `Category Hotel ${deleteCategory.nameCategoryHotel} deleted successfully`})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting Category', error: error })
    }
}
