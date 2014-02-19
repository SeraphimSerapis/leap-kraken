'use strict';

var paypal = require('paypal-rest-sdk');

module.exports = function (app) {
    /**
     * GET /pay
     * Being used to create a new payment and redirect over to PayPal for authorization
     */
    app.get('/pay', function (req, res) {
        var amount = req.query.amount;
        var payment_details = {
            'intent': 'sale',
            'payer': {
                'payment_method': 'paypal'
            },
            'redirect_urls': {
                'return_url': 'http://localhost:8000/pay/success',
                'cancel_url': 'http://localhost:8000/pay/cancel'
            },
            'transactions': [{
                'description': 'LeapKraken payment',
                'amount': {
                    'total': amount,
                    'currency': 'USD'
                }
            }]
        };
        paypal.payment.create(payment_details, function (error, payment) {
            if (error) {
                console.log(error);
                console.log(error.stack);
                res.render('paypal', {
                    'create': true,
                    'error': true,
                    'error_message': JSON.stringify(error, null, 2)
                });
            } else {
                req.session.payment_id = payment.id;
                payment.links.forEach(function (link) {
                    if (link.rel === 'approval_url') {
                        res.redirect(link.href + '&useraction=commit');
                    }
                });
            }
        });
    });

    /**
     * GET /pay/success
     * Is being used after a payment got authorized and PayPal redirects over to this app
     */
    app.get('/pay/success', function (req, res) {
        var payment_id = req.session.payment_id;
        var payment_details = { 'payer_id': req.query.PayerID };

        paypal.payment.execute(payment_id, payment_details, function (error, payment) {
            if (error) {
                console.log(error);
                console.log(error.stack);
                res.render('paypal', {
                    'execute': true,
                    'success': false,
                    'error_message': JSON.stringify(error, null, 2)
                });
            } else {
                res.render('paypal', {
                    'execute': true,
                    'success': true,
                    'payment': JSON.stringify(payment, null, 2)
                });
            }
        });
    });

    /**
     * GET /pay/cancel
     * Being triggered if the user chooses to cancel the payment after being redirect over to PayPal
     */
    app.get('/pay/cancel', function (req, res) {
        res.render('paypal', {
            'cancel': true
        });
    });
};
