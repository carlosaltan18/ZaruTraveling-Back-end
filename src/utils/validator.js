'use strict'

import { hash, compare} from 'bcrypt'

export const encrypt = (password)=>{
    try {

        return hash(password, 10)

    } catch (error) {
        console.error(error)
        return error
    }

}

export const checkPassword = async(password, hash)=>{
    try {
        return await compare(password, hash)
    } catch (error) {
        console.error(error)
        return error
    }
}

export const checkUpdateUser = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.password ||
            data.role) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateRole = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.username||
            data.nameUser||
            data.email ||
            data.password ||
            data.phone ||
            data.surname) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdatePassword = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.username||
            data.nameUser||
            data.email ||
            data.role ||
            data.phone ||
            data.name) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateCategory = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateComment = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ||
            data.user||
            data.hotel) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateHotel = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ) {
            return false
        }
        return true
    } else {
        return false
    }
}

export const checkUpdateRoom = async (data, id) => {
    if (id) {
        if (Object.entries(data).length === 0 ) {
            return false
        }
        return true
    } else {
        return false
    }
}