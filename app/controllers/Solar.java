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
                render("index.html", path, files);
	}

	public static void list(String path) {
                List<File> files = Arrays.asList(Play.getFile(path).listFiles());
                render("index.html", path, files);
	}

	public static void edit(String path) {
                File file = Play.getFile(path);
                String content = IO.readContentAsString(Play.getFile(path));
                render("edit.html", content, path);
	}

	public static void save() { 
		String path = params.get("path");
                String source = params.get("source");
		File file = Play.getFile(path);
		IO.writeContent(source, file);
	}

	public static void compile() {
                String path = params.get("path");
                String source = params.get("source");

                if (path.endsWith(".java")) {
                        javaCompile(source, path);
                } else {
                        boolean compile = true;
                        renderTemplate("compile.json", compile, 0, 0, 0, "");
                }
                        
        }

        private static void javaCompile(String source, String path) {
                String dotPath = path.replaceAll("/", ".");
                int offset = dotPath.indexOf("app.");
                if (offset == 0) {
                        /* remove app. prefix */
                        String classPath = dotPath.substring(4);
                        /* remove trailing .java */
                        classPath = classPath.substring(0, classPath.length()-5);

                        ApplicationClass applicationClass = Play.classes.getApplicationClass(classPath);
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
	}

}