package controllers;

import java.io.File;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Arrays;

import java.lang.reflect.Type;

import play.Play;
import play.mvc.*;
import play.libs.IO;

import play.classloading.ApplicationClasses.ApplicationClass;
import play.exceptions.CompilationException;

import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import util.*;

public class Solar extends Controller {

	public static void index() {
		String content = "hello world";
		render("index.html", content);
	}

	public static void list(String root) {
        List<File> fileList = Arrays.asList(Play.getFile(root).listFiles());
        try {
        	renderText(serialize(fileList).getBytes("utf-8"));
        } catch (UnsupportedEncodingException e) {
        	//do nothing 
        }
	}

	public static void load(String path) {
		 File file = Play.getFile(path);
         renderText(IO.readContentAsString(file).replace("\t", "    "));

	}

	public static void save() {
		InputStream is = request.body; 
		String path = params.get("id");		

		File file = Play.getFile(path);
		IO.write(is, file);
	}

	public static void compile(String path) {
		ApplicationClass applicationClass = Play.classes.getApplicationClass("controllers.Application");
        if (applicationClass != null) {
        	try {
            	applicationClass.refresh();
               	applicationClass.compile();
                renderText("compile");
           	} catch (CompilationException e) {
            	renderText("does not compile");
        	}          
    	} 
	}

	private static String serialize(List<File> list) {
        GsonBuilder gson = new GsonBuilder();
        Type listFileType = new TypeToken<List<File>>(){}.getType();
        gson.registerTypeAdapter(File.class, new FileSerializer(listFileType));
        gson.registerTypeAdapter(listFileType, new FileListSerializer());
        String result = gson.create().toJson(list, listFileType);
        return result;
    }

}