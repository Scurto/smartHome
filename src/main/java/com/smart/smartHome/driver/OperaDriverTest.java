package com.smart.smartHome.driver;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class OperaDriverTest {

    public static void main(String[] args) {
        System.setProperty("webdriver.chrome.driver", "C:\\testProjetcs\\smartHome\\src\\main\\resources\\chromedriver\\chromedriver.exe");
        ChromeOptions options = new ChromeOptions();
        options.addArguments("user-data-dir=C:\\Users\\scurto\\AppData\\Local\\Chromium\\User Data\\");
        options.addArguments("profile-directory=Profile 1");
        options.setBinary("C:\\testProjetcs\\smartHome\\src\\main\\resources\\Chrome-bin\\chrome.exe");
        WebDriver driver=new ChromeDriver(options);

        driver.manage().window().maximize();
        driver.get("https://profitcentr.com/work-task-read?adv=1068153");
//        start task
//        WebElement startBtn = driver.findElement(By.name("goform")).findElement(By.className("btn_big_green"));
//        System.out.println(startBtn);
//        startBtn.click();

//        add text to task
//        WebElement comment = driver.findElement(By.id("coment"));
//        comment.sendKeys("your value");


        try {
//            initiate stop task
//            WebElement stopTaskBtn = driver.findElement(By.className("btn_big_red"));
//            stopTaskBtn.click();
            Thread.sleep(2000);

//            popup before stop task
//            WebElement popup = driver.findElement(By.id("popup"));
//            System.out.println(popup);

//            TODO need to check
//            Thread.sleep(2000);
//            WebElement btn_red = popup.findElement(By.cssSelector(".btn.red"));
//            btn_red.click();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
//        driver.quit();


//        WebElement password=driver.findElement(By.id("user_password"));
//        WebElement login=driver.findElement(By.name("commit"));
//        username.sendKeys("abc@gmail.com");
//        password.sendKeys("your_password");
//        login.click();
//        String actualUrl="https://live.browserstack.com/dashboard";
//        String expectedUrl= driver.getCurrentUrl();
//        Assert.assertEquals(expectedUrl,actualUrl);

    }
}
