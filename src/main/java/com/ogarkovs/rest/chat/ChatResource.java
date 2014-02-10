package com.ogarkovs.rest.chat;

//import com.wordnik.swagger.annotations.Api;

import com.wordnik.swagger.annotations.Api;
import org.atmosphere.config.service.AtmosphereService;
import org.atmosphere.jersey.JerseyBroadcaster;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

@Path("/")
@Api(value = "/", description = "Operations with chat")
@AtmosphereService(broadcaster = JerseyBroadcaster.class)
public class ChatResource {

    @GET
    public String get() {
        return "hello";
    }
}
