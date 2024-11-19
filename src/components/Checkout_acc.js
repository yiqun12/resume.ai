/**
* Use the CSS tab above to style your Element's container.
*/
import React from 'react';

import firebase from 'firebase/compat/app';
import { useUserContext } from "../context/userContext";
import { useEffect } from 'react';
import { useState } from 'react';
import { useMyHook } from '../pages/myHook';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function Checkout(props) {
  // Format amount for diplay in the UI

  const { user, user_loading} = useUserContext();
  const { totalPrice } = props;
  /**listen to localtsorage */
  const { id, saveId } = useMyHook(null);
  useEffect(() => {
    //console.log('Component B - ID changed:', id);
  }, [id]);
//ishvoer:

const [isHover, setIsHover] = useState(false);

const handleMouseEnter = () => {
  setIsHover(true);
};

const handleMouseLeave = () => {
  setIsHover(false);
};

  function startDataListeners() {
    /**
     * Get all payment methods for the logged in customer
     */
    firebase
      .firestore()
      .collection('stripe_customers')
      .doc(user.uid)
      .collection('payment_methods')
      .onSnapshot((snapshot) => {
        console.log('read card')
        if (snapshot.empty) {
         // console.log('No payment methods found for the customer');
        
          //<option disabled="disabled" default="true"></option>
          let optionElement = document.createElement('option');
          optionElement.disabled = true;
          optionElement.id = "404null"
          optionElement.value = "null"
          if(document.getElementById('404null')){
          }else{
            document.querySelector('select[name=payment-method]').appendChild(optionElement);
            document.querySelector('#add-new-card').open = true;
            document.querySelector('[name=delete]').setAttribute('disabled', true);
            document.querySelector('[name=pay]').setAttribute('disabled', true);
          }


        } else {
          //console.log('payment methods found for the customer');
          if(document.getElementById('404null')){
            const optionElementToDelete = document.querySelector(`option[id="${'404null'}"]`);
            optionElementToDelete.remove();
           }else{
           }
 
        }
        snapshot.forEach(function (doc) {
          const paymentMethod = doc.data();
          if (!paymentMethod.card) {
            return;
          }

          const optionId = `card-${doc.id}`;
          let optionElement = document.getElementById(optionId);

         // console.log(document.getElementById(optionId))
          // Add a new option if one doesn't exist yet.
          if (!optionElement) {
            optionElement = document.createElement('option');
            //console.log("hello")
            optionElement.id = optionId;
            document.querySelector('select[name=payment-method]').appendChild(optionElement);
           // console.log(optionElement.id)
          }

          optionElement.value = paymentMethod.id;
          optionElement.setAttribute("data-type", paymentMethod.card.brand);
          //console(optionElement.value)
          optionElement.text = `•••• ${paymentMethod.card.last4} | ${paymentMethod.card.exp_month}/${parseInt(paymentMethod.card.exp_year) % 100}`;
          optionElement.selected = true;

          saveId(Math.random())
          // get the select element
          //console.log("exist card:",optionElement.text)
        });
      });


            // for translation
            const trans = JSON.parse(sessionStorage.getItem("translations"))
            const t = (text) => {
              // const trans = sessionStorage.getItem("translations")
             // console.log(trans)
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

    document
      .querySelector('#payment-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        if (event.submitter.name === 'delete') {
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = true));
          const form = new FormData(event.target);
          const paymentMethodValue = form.get('payment-method');
          const paymentMethodId = document.querySelector(`option[value="${paymentMethodValue}"]`).id;
          const new_paymentMethodId = paymentMethodId.substring(5);
         // console.log("deleted click")
        // console.log(new_paymentMethodId);
          await firebase
            .firestore()
            .collection('stripe_customers')
            .doc(user.uid)
            .collection('payment_methods')
            .doc(new_paymentMethodId)
            .delete();
            const optionIdToDelete = paymentMethodId;
            const optionElementToDelete = document.querySelector(`option[id="${optionIdToDelete}"]`);
            if (optionElementToDelete) {
              optionElementToDelete.remove();
            }
          document
            .querySelectorAll('button')
            .forEach((button) => (button.disabled = false));
                    // set the prompt message
                    const promptMessage = document.querySelector('#delete-message');
                    promptMessage.textContent = t("successfully deleted") + "!";

                    // hide the error message after 2 seconds
                    setTimeout(() => {
                      promptMessage.textContent = "";
                    }, 6000);
        }

      });
  }

  function zeroDecimalCurrency(amount, currency) {
    let numberFormat = new Intl.NumberFormat(['en-US'], {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    });
    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;
    for (let part of parts) {
      if (part.type === 'decimal') {
        zeroDecimalCurrency = false;
      }
    }
    return zeroDecimalCurrency;
  }


  useEffect(() => {
    startDataListeners();
  }, []);

  const [selectedOption, setSelectedOption] = useState('');

  function handleOptionChange(event) {
    const selectedIndex = event.target.selectedIndex;
    const selectedOption = event.target.options[selectedIndex];
    const dataType = selectedOption.getAttribute("data-type");
    setSelectedOption(dataType);
    //console.log(dataType)
  }
  //console.log(selectedOption)

          // for translation
          const trans = JSON.parse(sessionStorage.getItem("translations"))
          const t = (text) => {
            // const trans = sessionStorage.getItem("translations")
          //  console.log(trans)
          //  console.log(sessionStorage.getItem("translationsMode"))
        
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
    <div>
    <div id="card2-header">
      <div id="add-new-card">
      <form id="payment-form">
        <div>
          <label style={{ width: '100%' }}>

            <div className="row row-1 pt-0 p-0">
              <div className="col-2 p-0">
                {selectedOption === 'mastercard' ? (
                  <img className="img-fluid" src="https://img.icons8.com/color/48/000000/mastercard-logo.png" />
                ) : (
                  <img className="img-fluid" src="https://img.icons8.com/color/48/000000/visa.png" />
                )}

              </div>
              
              <div className="col-7 select-dropdown h6 font-semibold text-muted text-sm ">
                <select style={{ backgroundcolor: "white",color: "#9ca3af" }} name="payment-method" onChange={handleOptionChange} required>
                  <option hidden data-type="mastercard">{t("Select Account")}</option>
                </select>
              </div>
              <div className="col-3 d-flex justify-content-end p-0">
                <button                 onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
             type="submit" style={{ 'color': isHover ? '#0a58ca' : '#444444' }}             

            name="delete"><FontAwesomeIcon icon={faTrash} /></button>
                
              </div>
            </div>
            
          </label>
        </div>
        <div id="delete-message" role="alert"></div>
      </form>
    </div>
    </div>
    </div>
  );
};

export default Checkout;


