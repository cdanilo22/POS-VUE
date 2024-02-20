import {ref, computed, watchEffect} from 'vue'
import {defineStore} from 'pinia'
import { collection, addDoc, runTransaction, doc} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useCouponStore } from './coupons'
import { getCurrentDate } from '@/helpers'


export const useCartStore = defineStore('cart', () => {
    
    const cupon = useCouponStore()
    const db = useFirestore()
    const items = ref([])
    const subtotal = ref(0)
    const impuestos = ref(0)
    const total = ref(0)
    const date = getCurrentDate()
    const MAX_PRODUCTS = 5
    const IVA = .12
   


    watchEffect(() => {
        subtotal.value = items.value.reduce((total, item) => total + (item.quantity * item.price), 0 ) 
        impuestos.value = Number((subtotal.value * IVA ).toFixed(2)) 
        total.value = Number(((subtotal.value + impuestos.value) - cupon.discount).toFixed(2))
    })


    function addItem(item){
        const index = isItemInCart(item.id)
        if(index >= 0) {
            if(isProductAvailable(item, index)) {
                alert('Has alcanzado el límite')
                return
            }
            //Actualizar la cantidad
            items.value[index].quantity++
        } else{
            items.value.push({...item, quantity: 1, id: item.id})
        } 
    }

    function updateQuantity(id, quantity) {
        items.value = items.value.map(item => item.id === id ? {...item, quantity } : item)
    }

    function removeItem(id){
        items.value = items.value.filter(item => item.id !== id)
    }


    async function checkout() {
        try {
            await addDoc(collection(db, 'sales'), {
                items:  items.value.map(item => {
                    const {availability, category, ...data} = item
                    return data
                }),
                subtotal: subtotal.value ,
                impuestos: impuestos.value,
                discount: cupon.discount,
                total: total.value,
                date

            })

            //Sustraer la cantidad de lo disponible
            items.value.forEach(async(item)=> {
                const productRef = doc(db, 'products', item.id)
                await runTransaction(db, async (transaction) => {
                    const currentProduct = await  transaction.get(productRef)
                    const availability = currentProduct.data().availability - item.quantity
                    transaction.update(productRef, {availability} )
                })
            })

            
            //Reiniciar el state
            $reset()
            cupon.$reset()

        } catch (error) {
            console.log(error);
        }
       
    }


    function $reset() {
        items.value = []
        subtotal.value = 0
        impuestos.value = 0
        total.value = 0
    }


    const isItemInCart = id => items.value.findIndex(item => item.id === id)

    const isProductAvailable = (item, index) => {
        return items.value[index].quantity >= item.availability || items.value[index].quantity >= MAX_PRODUCTS
    }
    const isEmpty = computed (() => items.value.length === 0)


    const checkProductsAvailability = computed(() => {
        return (product) =>  product.availability < MAX_PRODUCTS ? product.availability : MAX_PRODUCTS

    })

    return {
        items,
        subtotal,
        impuestos,
        total,
        addItem,
        updateQuantity,
        removeItem,
        checkout,
        isEmpty,
        checkProductsAvailability
    }

})