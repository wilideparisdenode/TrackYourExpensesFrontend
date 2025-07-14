import { configureStore } from "@reduxjs/toolkit";
import expenseSlice from "./expenseSlice"


export const  store=configureStore({

    reducer:{
        expense:expenseSlice
    }
   
})