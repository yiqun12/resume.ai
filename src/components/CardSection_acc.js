//import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import React, { useRef, useEffect } from 'react';
import { useState } from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
//import { useEffect } from 'react';
import e from 'cors';
import './blueButton.css';
import { useMyHook } from '../pages/myHook';
import { AddressElement } from '@stripe/react-stripe-js';
import { MDBCheckbox } from 'mdb-react-ui-kit';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "15px",
      "::placeholder": {
        color: "#aab7c4",
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};



function CardSection(props) {
  const isChecked = useRef(true);

  function handleCheckboxChange() {
    //console.log(!isChecked.current)
    isChecked.current = !isChecked.current
  }
  
  
  const { totalPrice } = props;
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);


  const { user, user_loading} = useUserContext();
  const stripe = useStripe();
  const elements = useElements();
  //console.log(user.uid)
  const customerData = useRef();

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .onSnapshot((snapshot) => {
        console.log('read card')
        if (snapshot.data()) {
          customerData.current = snapshot.data();
          //console.log(snapshot.data())
          
        }
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      document
        .querySelector('#payment-method-form')
        .addEventListener('submit', async (event) => {
          event.preventDefault();
          if (!event.target.reportValidity()) {
            return;
          }
          //console.log(customerData.current == null)
          //console.log(!elements)
          //console.log(!stripe)
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = true));
          //  console.log(customerData.current)
          if (!stripe || !elements || customerData.current == null) {
            //document.querySelector('#prompt-message').textContent = "Too frequent operations";
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            document
              .querySelectorAll('button')
              .forEach((button) => (button.disabled = false));

            return;
          } else {

            // Payment method has not yet been added
            // Proceed with adding payment method
            const form = new FormData(event.target);
            const cardholderName = form.get('First Name')+" "+form.get('Last Name')

            const { setupIntent, error } = stripe.confirmCardSetup(
              customerData.current.setup_secret,
              {
                payment_method: {
                  card: elements.getElement(CardElement),
                  billing_details: {
                    name: cardholderName,
                  },
                },
              }
            ).then(function (result) {
             // console.log(result.error);
              if (result.error != null) {
              //  console.log('error');
                document.querySelector('#prompt-message').textContent = result.error.message;
                document
                  .querySelectorAll('button')
                  .forEach((button) => (button.disabled = false));
              } else if (result.setupIntent != null) {

                firebase
                  .firestore()
                  .collection('stripe_customers')
                  .doc(user.uid)
                  .collection('payment_methods')
                  .add({ id: result.setupIntent.payment_method })
                  .then(() => {
                    //console.log(res)
                    // Payment method was successfully added
                    //console.log(result.setupIntent.payment_method)
                    document
                      .querySelectorAll('button')
                      .forEach((button) => (button.disabled = false));
                    // set the prompt message
                    const promptMessage = document.querySelector('#prompt-message');
                    promptMessage.textContent = t("successfully added") + "!";

                    // hide the error message after 2 seconds
                    setTimeout(() => {
                      promptMessage.textContent = "";
                    }, 6000);
                    // reset the form inputs
                    const form = document.querySelector('#payment-method-form');
                    form.reset();
                    // clear the card details input field
                    if (elements) {
                      const cardElement = elements.getElement(CardElement);
                      cardElement.clear();
                    }
                    saveId(Math.random())
                    //customerData.current = null //cleanup
                  })
              }
            });
          }
        });
    }, 1);

  }, [customerData.current, stripe, elements,isChecked.current ]);

  // for translate
  const trans = JSON.parse(sessionStorage.getItem("translations"))
  const t = (text) => {
    // const trans = sessionStorage.getItem("translations")
    //console.log(trans)
   // console.log(sessionStorage.getItem("translationsMode"))

    if (trans != null) {
      if (sessionStorage.getItem("translationsMode") != null) {
        // return the translated text with the right mode
        if (trans[text] != null) {
            if (trans[text][sessionStorage.getItem("translationsMode")] != null)
              return trans[text][sessionStorage.getItem("translationsMode")]
        }
      }
    } 
    // base case to just return the text if no modes/translations are found
    return text
  }


  return (
    <div id="card2-header">
      <div id="add-new-card">
        <form id="payment-method-form">
          <div id="card-element" >
          <div className="row-1 m-0" style={{  marginTop: "5px", borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0,
            }}>
              <span id="card2-inner" style={{
                'paddingLeft': 0,
                'paddingRight': 0,
                color: "black"
              }} >{t("Card holder name")}</span>
            </div>
            <div className="row row-2" style={{
              'paddingLeft': 0,
              'paddingRight': 0
            }}>
              <div class="flex flex-wrap -mx-2" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <div class="w-1/2 px-2">
                  <input class="w-full bg-transparent border-none focus:outline-none" type="text" name="First Name" required placeholder={t("First Name")} 
                   translate="no" />
                </div>
                <div class="w-1/2 px-2 flex justify-end">
                  <input class="w-full bg-transparent border-none focus:outline-none" type="text" name="Last Name" required placeholder={t("Last Name")} 
                   translate="no" />
                </div>
              </div>
            </div>
          </div>
            <div className="row-1" style={{ "border-radius": '0px', marginTop: "0px", marginBottom: "5px", width: "100%" }}>
              <div className="row row-2" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <span id="card2-inner" style={{
                  'paddingLeft': 0,
                  'paddingRight': 0,
                  color: "black"
                }}>{t("Credit Card Number")}</span>
              </div>
              <div className="row row-2" style={{
                'paddingLeft': 0,
                'paddingRight': 0
              }}>
                <span class="notranslate"  style={{
                  'paddingLeft': 0,
                  'paddingRight': 0
                }}>                  
                <CardElement
                    id="card-element" options={CARD_ELEMENT_OPTIONS} />
                </span>
              </div>
            </div>

            {/*The following US states and territories are not currently supported by Stripe and will not be accepted for validation:"AMERICAN SAMOA", "MICRONESIA", "GUAM", "MARSHALL ISLANDS", "NORTHERN MARIANA ISLANDS", "PALAU", "UNITED STATES MINOR OUTLYING ISLANDS", "VIRGIN ISLANDS"*/}
          </div>


          <div id="prompt-message" role="alert"></div>
         {/* save card checkbox for future use*/}
          {/* <MDBCheckbox
            name='flexCheck'
            value=''
            id='flexCheckChecked'
            label={t('Save Card')}
            defaultChecked={isChecked.current}
            onChange={handleCheckboxChange}
          /> */}

          <button style={{ width: "100%" }} class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 ">{t("Pay")} ${totalPrice}</button>
        </form>

      </div>
    </div>
  );
};

export default CardSection;


// */