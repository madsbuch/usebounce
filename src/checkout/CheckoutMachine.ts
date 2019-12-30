import { Machine } from "xstate";

export interface Context {
  placeOrder: () => Promise<void>
}

export const makeCheckoutMachine = (placeOrder: () => Promise<void>) => Machine<Context>({
  id: 'checkout',
  initial: 'numberSelection',
  context: {
    placeOrder
  },
  states: {
    numberSelection: {
      on: {
        NEXT: 'personalDetails'
      },
      meta: {
        showNumberSelector: true,
        nextTxt: 'Next'
      }
    },
    personalDetails: {
      on: {
        NEXT: 'paymentDetails'
      },
      meta: {
        showNumberSelector: true,
        showPersonalForm: true,
        nextTxt: 'Next'
      }
    },
    paymentDetails: {
      on: {
        NEXT: 'processing'
      },
      meta: {
        showNumberSelector: true,
        showPersonalForm: true,
        showPaymentForm: true,
        nextTxt: 'Book'
      }
    },
    processing: {
      invoke: {
        id: 'placeOrder',
        src: async (context, event) => await context.placeOrder(),
        onDone: {
          target: 'success',
          actions: () => console.log('SUCC')
        },
        onError: {
          target: 'failure',
          actions: () => console.log('ERR')
        }
      },
      meta: {
        showLoading: true
      }
    },
    success: {
      meta: {
        showSuccess: true
      }
    },
    failure: {
      meta: {
        showFailure: true
      }
    }
  }
});