package com.smart.smartHome.controller;

import com.smart.smartHome.common.PkDevice;
import com.smart.smartHome.model.Greeting;
import com.smart.smartHome.model.HelloMessage;
import com.smart.smartHome.service.PkService;
import lombok.AllArgsConstructor;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

import javax.sound.sampled.*;
import java.io.IOException;
import java.io.InputStream;

@RestController
@AllArgsConstructor
public class TestController {

    private final SimpMessagingTemplate template;
    private final PkService pkService;

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(HelloMessage message) throws Exception {
        Thread.sleep(1000); // simulated delay
        return new Greeting("Hello, " + HtmlUtils.htmlEscape(message.getName()) + "!");
    }

    @MessageMapping("/helloTest")
    public Greeting helloTest(HelloMessage message) throws Exception {
        Thread.sleep(1000); // simulated delay
        return new Greeting("Hello, " + HtmlUtils.htmlEscape(message.getName()) + "!");
    }


    @GetMapping("/test")
//    @SendTo("/topic/greetings")
    public String test() {
        template.convertAndSend("/topic/greetings", new Greeting("Fire"));
        template.convertAndSend("/topic/myTest", new Greeting("Fire"));
//        return new Greeting("Hello, " + HtmlUtils.htmlEscape("Scurto") + "!");
//        String volume = pkService.getAudioVolume(PkDevice.SPEAKERS.getValue());
//        showsounddevices();
//        try {
//            getCurrentSystemVolume("Speakers");
//            getCurrentSystemVolume("LG");
//            System.out.println();
//            setSystemVolume(37);
//            setAudioDevice("Speakers");
//            setAudioDevice("LG");
//            svcl.exe /Stdout /GetPercent "Speakers"
//            svcl.exe /Stdout /GetPercent "LG"
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }

//        try {
//            System.setProperty("webdriver.chrome.driver", "C:\\testProjetcs\\smartHome\\src\\main\\resources\\chromedriver\\chromedriver.exe");
//            WebDriver driver = new ChromeDriver();
//            driver.get("http://www.google.com/");
//            Thread.sleep(5000);  // Let the user actually see something!
//            WebElement searchBox = driver.findElement(By.name("q"));
//            searchBox.sendKeys("ChromeDriver");
//            searchBox.submit();
//            Thread.sleep(5000);  // Let the user actually see something!
//            driver.quit();
//        } catch (InterruptedException e) {
//            throw new RuntimeException(e);
//        }
        return "OK";
    }
}