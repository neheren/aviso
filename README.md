# AVISO - connecting Facebook to sms
## Connect old phones to facebook using this application together with message bird

The application is based on a node server using several npm modules. 
I use the message bird API together with a unofficial facebook API to forward any incoming facebook message to a given phone number.

When the facebook message has been received via SMS, one is able to answer using a given id. The id goes from 0 to the amount of facebook friends present. It is also possible to search for these ids, by sending and SMS the messenger, see example:

To send a facebook message via SMS, you start of by searching for an id by typing ‘get'. e.g:

[SMS from 447860039047]
Nikolaj Sørensen - 116
Nikolaj Schlüter - 302
Nikolaj Schildt - 302

Now one is able to send a facebook message. e.g:

[SMS to 447860039047]
msg 302 Hello my friend, what’s going on back home?

And he might answer:

[SMS from 447860039047]
Message from Nikolaj S. N.
Yo! Nothing really I’m just chilling on facebook.
Answer id: 302

This way, you can keep yorself up-to-date even though you're sporting the old Nokia ;)
