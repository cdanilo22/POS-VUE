<script setup>
    import ShoppinCartItem from './ShoppinCartItem.vue';
    import { useCartStore} from '../stores/cart';
    import Amount from './Amount.vue';
    import CouponForm from './CouponForm.vue'
    import { formatCurrency } from '@/helpers';
    import { useCouponStore } from '@/stores/coupons';
   
   const cart = useCartStore()
   const cupon = useCouponStore()
</script>
<template>

    <p v-if="cart.isEmpty" class="text-xl text-center text-gray-900 mt-10 font-bold">
        El Carrito está vacio
    </p>

    <div v-else>
        <p class="text-4xl font-bold text-gray-900 mt-10">Resumen de Venta</p>
        <ul 
            role="list"
            class="mt-6 divide-y"
        >

            <ShoppinCartItem
                v-for="item in cart.items"
                :key="item.id"
                :item="item"
            />
        </ul>

        <dl class="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
            <Amount>
                <template #label>Subtotal:</template>
                {{ formatCurrency(cart.subtotal) }}
            </Amount>

            <Amount>
                <template #label>Impuestos:</template>
                {{ formatCurrency(cart.impuestos) }}
            </Amount>

            <Amount v-if="cupon.isValidCoupon" >
                <template #label>Descuento:</template>
                {{ formatCurrency(cupon.discount) }}
            </Amount>

            <Amount>
                <template #label>Total a pagar:</template>
                {{ formatCurrency(cart.total) }}
            </Amount>
        </dl>

        <CouponForm/>

        <button
            type="button"
            class="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white uppercase font-bold p-3"
            @click="cart.checkout"
            >
            Confirmar Compra
        </button>

    </div>

</template>