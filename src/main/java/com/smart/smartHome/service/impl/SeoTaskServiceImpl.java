package com.smart.smartHome.service.impl;

import com.smart.smartHome.service.SeoTaskService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeoTaskServiceImpl implements SeoTaskService {

    @Value("classpath:chromedriver/chromedriver.exe")
    Resource chromeDriverFile;

    @Value("classpath:Chrome-bin/chrome.exe")
    Resource chromiumFile;

    @Override
    public void startTask() throws IOException {
        System.setProperty("webdriver.chrome.driver", chromeDriverFile.getFile().getAbsolutePath());
        ChromeOptions options = new ChromeOptions();
        options.addArguments("user-data-dir=C:\\Users\\scurto\\AppData\\Local\\Chromium\\User Data\\");
        options.addArguments("profile-directory=Profile 1");
        options.setBinary(chromiumFile.getFile().getAbsolutePath());
        WebDriver driver=new ChromeDriver(options);

        driver.manage().window().maximize();
//        driver.get("https://profitcentr.com/work-task-read?adv=1068153");
        driver.get("https://profitcentr.com/work-task-read?adv=729950");

        validateTaskInfo(driver);
//        start task
//        WebElement startBtn = driver.findElement(By.name("goform")).findElement(By.className("btn_big_green"));
//        System.out.println(startBtn);
//        startBtn.click();

//        add text to task
//        WebElement comment = driver.findElement(By.id("coment"));
//        comment.sendKeys("your value");


//        try {
//            initiate stop task
//            WebElement stopTaskBtn = driver.findElement(By.className("btn_big_red"));
//            stopTaskBtn.click();
//            Thread.sleep(4000);

//            popup before stop task
//            WebElement popup = driver.findElement(By.id("popup"));
//            System.out.println(popup);

//            TODO need to check
//            Thread.sleep(2000);
//            WebElement btn_red = popup.findElement(By.cssSelector(".btn.red"));
//            btn_red.click();
//        } catch (InterruptedException e) {
//            throw new RuntimeException(e);
//        }
//        driver.quit();

    }

    private void validateTaskInfo(WebDriver driver) {
        WebElement taskId = driver.findElement(By.id("maincolumn"))
                .findElement(By.className("blok"))
                .findElement(By.tagName("h1"));
        System.out.println(taskId.getText()); /*Задание № 729950*/

        WebElement taskDescription = driver.findElement(By.id("maincolumn"))
                .findElement(By.className("maintask"));
        String descriptionText = "Если вы из России, меняйте IP, а для других стран используйте только родной!\n" + "\n" + "Перед выполнением чистим куки! (ctrl+shift+delete)\n" + "\n" + "1) В поиске Ютуб вбиваем: nikatmg\n" + "\n" + "2) Находим канал : NikaTMG (https://prnt.sc/17mjyfq)\n" + "\n" + "3) Смотрим 3-4 свежих видео ( 30-40 сек)\n" + "\n" + "4) Кликаем по рекламе на 3 последнее загруженное видео (gclid) , ждем полной загрузки и делаете 2-3 перехода не меньше 30 сек каждый! (имитируем активность)\n" + "\n" + "Рекламы должны быть разные!\n" + "\n" + "Длительность проверяю!\n" + "\n" + "Спасибо Вам за качественное выполнение;)\n" + "\n" + "Посмотреть все задания автора\n" + "https://profitcentr.com/work-task?id_rekl=gamersh";
        System.out.println("Description matched => " + descriptionText.equals(taskDescription.getText()));

        WebElement taskRequirements = driver.findElement(By.id("maincolumn"))
                .findElement(By.className("yellowbk"));

        String requirementsText = "1) Ссылки на 3-4 видео\n" + "2) Ссылки на 3 разных рекламный сайт + переходы\n" + "\n" + "Или делаете скриншот истории браузера\n" + "\n" + "Меняйте IP, только если вы из России!!!";
        System.out.println("Requirements matched => " + requirementsText.equals(taskRequirements.getText()));
    }
}
