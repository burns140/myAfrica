import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.beans.IntrospectionException;


public class FixedTest {
    String url = "file:///C:/Users/steph/Desktop/adaptive_project/Africa-Map-Project/E1/experiment.html";
    //String url = "https://jarvis.psych.purdue.edu/weblab/Burns/africa-map-project/E1/lab-start.html";
    @Test
    public void fixedTest() throws InterruptedException {
        WebDriver driver = null;
        int breaks = 0;
        try {
            driver = chromeBrowser();
        } catch (Throwable e) {
            System.out.println(e);
        }
        Actions actions = new Actions(driver);

        WebDriverWait wait = new WebDriverWait(driver, 10);
        driver.get(url);
        WebElement cb = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("cb1")));
        JavascriptExecutor executor = (JavascriptExecutor) driver;
        executor.executeScript("arguments[0].click();", cb);
        WebElement startButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("continue_btn")));
        startButton.click();
        WebElement age = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("age_demo")));
        age.sendKeys("22");
        WebElement gender = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("gender_demo")));
        gender.sendKeys("female");
        startButton = wait.until(ExpectedConditions.elementToBeClickable(By.id("continue_btn")));
        startButton.click();
        startButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Continue']")));
        Thread.sleep(2000);
        executor.executeScript("arguments[0].click();", startButton);
        startButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Continue']")));
        Thread.sleep(2000);
        executor.executeScript("arguments[0].click();", startButton);
        Thread.sleep(3000);
        int i = 0;
        int total = 0;
        boolean post = false;
        while (!post) {
            //while (!(driver.findElements(By.xpath("//button[text()='Continue']")).size() > 1)) {
            while (!(driver.findElements(By.xpath("//h1[contains(text(), 'Instructions')]")).size() > 0)) {
                total++;
                WebElement countryButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='ethiopia']")));
                Thread.sleep(1000);
                executor.executeScript("arguments[0].click();", countryButton);
                Thread.sleep(1000);
                WebElement nextButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Next']")));
                Thread.sleep(1000);
                executor.executeScript("arguments[0].click();", nextButton);
                i++;
                if (i > 21 || total > 90) {
                    Thread.sleep(1500);
                }
            }
            i = 0;
            Thread.sleep(1500);
            Thread.sleep(2000);
            if (driver.findElements(By.xpath("//button[text()='Begin']")).size() > 0) {
                WebElement begin = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Begin']")));
                executor.executeScript("arguments[0].click();", begin);
                post = true;
                Thread.sleep(3000);
            } else if (driver.findElements(By.xpath("//button[text()='Continue']")).size() > 0) {
                WebElement nextButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Continue']")));
                executor.executeScript("arguments[0].click();", nextButton);
            } else {
                System.out.println("donesters");
                break;
            }
        }
        while (!(driver.findElements(By.xpath("//h1[contains(text(), 'Debriefing')]")).size() > 0)) {
            WebElement countryButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='ethiopia']")));
            Thread.sleep(1000);
            executor.executeScript("arguments[0].click();", countryButton);
            Thread.sleep(1000);
            WebElement nextButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[text()='Next']")));
            Thread.sleep(1000);
            executor.executeScript("arguments[0].click();", nextButton);
            i++;
            if (i > 21) {
                Thread.sleep(1500);
            }
        }

    }

    public static WebDriver chromeBrowser() throws Throwable {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--allow-file-access-from-files\n");
        WebDriver driver = new ChromeDriver(options);
        return driver;
    }

}
