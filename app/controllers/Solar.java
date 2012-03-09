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
        String path = "";
        List<File> files = Arrays.asList(Play.getFile(path).listFiles());
		//String content = IO.readContentAsString(Play.getFile("app/controllers/Application.java"));
        render("index.html", path, files);
	}

	public static void list(String path) {
        List<File> files = Arrays.asList(Play.getFile(path).listFiles());
        render("index.html", path, files);

        /*try {
        	renderText(serialize(fileList).getBytes("utf-8"));
        } catch (UnsupportedEncodingException e) {
        	//do nothing 
        }*/
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

	public static void compile() {
        String source = params.get("source");
		ApplicationClass applicationClass = Play.classes.getApplicationClass("controllers.Application");
        if (applicationClass != null) {
        	try {
            	applicationClass.refresh();
                /* the magic is here :) */
               	applicationClass.javaSource = source;
                applicationClass.compile();
                boolean compile = true;
                renderTemplate("compile.json", compile, 0, 0, 0, "");
           	} catch (CompilationException e) {
                int errorLine = e.getLineNumber();
                int srcStart = e.getSourceStart();
                int srcEnd = e.getSourceEnd();
                String msg = e.getMessage();
                boolean compile = false;
                renderTemplate("compile.json", compile, errorLine, srcStart, srcEnd, msg);
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