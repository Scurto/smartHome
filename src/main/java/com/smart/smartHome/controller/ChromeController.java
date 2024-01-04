package com.smart.smartHome.controller;

import com.smart.smartHome.controller.listener.WebsocketChromeListener;
import com.smart.smartHome.model.Greeting;
import com.smart.smartHome.model.chrome.ChromeTab;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Date;

@RestController
@RequestMapping("/chrome")
@AllArgsConstructor
public class ChromeController {

    private final SimpMessagingTemplate template;
    private final WebsocketChromeListener listener;

    @GetMapping("/tabs")
    public ArrayList<ChromeTab> tabs() throws InterruptedException {
        ArrayList<ChromeTab> response = new ArrayList<>();

        response.addAll(fetchTabs(0));
        listener.setTabs(null);
        return response;
    }

    private ArrayList<ChromeTab> fetchTabs(int i) throws InterruptedException {
//        System.out.println("1 " + new Date());
        template.convertAndSend("/topic/greetings", new Greeting("Fire"));
        Thread.sleep(1000);
        if (listener.getTabs() == null) {
//            System.out.println("2 " + new Date());
            i++;
            if (i == 5) {
                throw new RuntimeException("too many connections");
            }
            return fetchTabs(i);
        }
        return listener.getTabs();
    }
}
