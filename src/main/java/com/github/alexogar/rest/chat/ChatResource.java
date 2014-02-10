/*
 * Copyright 2014 Jeanfrancois Arcand
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package com.github.alexogar.rest.chat;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;
import org.atmosphere.annotation.Broadcast;
import org.atmosphere.annotation.Suspend;
import org.atmosphere.config.service.AtmosphereService;
import org.atmosphere.cpr.AtmosphereResourceEvent;
import org.atmosphere.cpr.AtmosphereResourceEventListenerAdapter;
import org.atmosphere.jersey.JerseyBroadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Path("/chat")
@Api(value = "/chat", description = "RESTful operations for chat")
@AtmosphereService (path = "chat", broadcaster = JerseyBroadcaster.class)
public class ChatResource {

    private volatile static List<Message> messages = new CopyOnWriteArrayList<Message>();

    private volatile Map<String,String> users = new ConcurrentHashMap<String, String>();

    @XmlRootElement(name="list")
    @XmlSeeAlso(value = {Message.class})
    public static class ListWrapper<T> {
        public T[] list;
        public ListWrapper() {}
        public ListWrapper(List<Message> list) {this.list = (T[]) list.toArray();}
    }

    @GET
    @ApiOperation(response = List.class, value = "Return all current messages in chat")
    @ApiResponses({
            @ApiResponse(code = 204, message = "Messages list empty"),
            @ApiResponse(code = 200, message = "List with messages")
    })
    @Produces("application/json")
    @Path("/messages")
    public Response messages() {
        if (messages.isEmpty()) return Response.noContent().build();
        else return Response.ok(new ListWrapper<Message>(messages)).build();
    }

    @GET
    @ApiOperation(response = List.class, value = "Return all users in room")
    @ApiResponses({
            @ApiResponse(code = 204, message = "User list empty"),
            @ApiResponse(code = 200, message = "List with users")
    })
    @Produces("application/json")
    @Path("/users")
    public Response users() {
        if (users.isEmpty()) return Response.noContent().build();
        else return Response.ok(users.keySet()).build();
    }

    /**
     * Suspend the response without writing anything back to the client.
     *
     * @return a white space
     */
    @Suspend(contentType = "application/json", listeners = {OnDisconnect.class})
    @GET
    public String suspend() {
        return "";
    }

    /**
     * Broadcast the received message object to all suspended response. Do not write back the message to the calling connection.
     *
     * @param message a {@link Message}
     * @return a {@link Message}
     */
    @Broadcast(writeEntity = false)
    @POST
    @Produces("application/json")
    public Message broadcast(Message message) {
        messages.add(message);
        return new Message(message.author,message.message, message.timestamp);
    }

    public static final class OnDisconnect extends AtmosphereResourceEventListenerAdapter {
        private final Logger logger = LoggerFactory.getLogger(ChatResource.class);

        /**
         * {@inheritDoc}
         */
        @Override
        public void onDisconnect(AtmosphereResourceEvent event) {
            if (event.isCancelled()) {
                logger.info("Browser {} unexpectedly disconnected", event.getResource().uuid());
            } else if (event.isClosedByClient()) {
                logger.info("Browser {} closed the connection", event.getResource().uuid());
            }
        }
    }

}
