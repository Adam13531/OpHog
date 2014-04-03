# Thu 04/03/2014 - 01:37 PM
#
# This will concatenate all .js files into a single file, then run UglifyJS on
# it.
# 
# Order of the JavaScript files matters, so we can't just consolidate them all
# using a one-line batch script:
#   for /F %%G in ('dir /s /b %1\*.js') do (type %%G >> %outputFile%)
#   
# Requirements for this script:
#   node.js - it must be in your PATH. If it isn't, then just modify minifyFile
#       in this script to point directly to node.js on your computer.
#       http://nodejs.org/
#   UglifyJS - https://github.com/mishoo/UglifyJS

import os
import sys
import re
import subprocess

# The name that appears in each <script> tag in the html file.
JS_DIRECTORY_NAME = 'js'

# The name of the minified output of this script.
MINIFIED_JS_NAME = 'min.js'

# The path to the minified JavaScript output.
minifiedJsFilePath = None

# The path to index.html that you provide to this script.
inputHtml = None

# The output HTML file that will now reference the minified script.
outputHtmlFilePath = None

# This is the "js" directory that exists alongside index.html. It is computed by
# this script, but it still needs to exist.
jsDir = None

# The path to UglifyJS. It is assumed that 
uglifyJsPath = None

# Concatenates the contents of each file.
# jsFiles - an array of paths (they can be relative) to each JavaScript file.
def concatenateAllFiles(jsFiles) :
    with open(minifiedJsFilePath, 'w') as concatFile :
        for jsFile in jsFiles :
            with open(jsFile, 'r') as f :
                lines = f.readlines()

            for line in lines :
                concatFile.write(line)

def verifyArgs() :
    global inputHtml, outputHtmlFilePath, jsDir, minifiedJsFilePath, uglifyJsPath

    args = sys.argv
    if len(args) is not 4 :
        print 'Usage: %s <path to index.html> <path to output file> <path to uglifyjs>' % (args[0])
        return False

    # It would be better to check for path equality, but it's better to have
    # SOME error-checking than none.
    if args[1].lower() == args[2].lower() :
        print 'Error: you can\'t specify the same input/output file'
        return False

    inputHtml = args[1]
    outputHtmlFilePath = args[2]
    uglifyJsPath = args[3]

    inputDir = os.path.dirname(inputHtml)
    jsDir = os.path.join(inputDir, JS_DIRECTORY_NAME)
    minifiedJsFilePath = os.path.join(jsDir, MINIFIED_JS_NAME)

    if not os.path.exists(inputHtml) :
        print 'Error: %s doesn\'t exist.' % (inputHtml)
        return False

    if not os.path.exists(uglifyJsPath) :
        print 'Error: %s doesn\'t exist.' % (uglifyJsPath)
        return False

    if not os.path.exists(jsDir) :
        print 'Error: %s doesn\'t exist. index.html must be located alongside a "%s" directory for this script to work.' % (jsDir, JS_DIRECTORY_NAME)
        return False

    return True

# Go through index.html and find all the JavaScript files that need to be
# consolidated. This also starts writing to the output index.html file
def findJsFilesToConsolidate() :
    jsFiles = []

    # Read all lines from index.html
    with open(inputHtml, 'r') as f :
        lines = f.readlines()

    outputHtmlFile = open(outputHtmlFilePath, 'w')

    foundBody = False
    wroteMinifiedJsLine = False
    for line in lines :
        writeLine = True

        # Ignore any <script> tags until we've found the <body> tag. This way,
        # scripts in the <head> will still be executed. It's possible that I
        # don't need to do this and I can minify the <head> scripts too, but I
        # want to be safe.
        if not foundBody :
            if re.match(".*<body>.*", line, re.IGNORECASE) :
                foundBody = True
        else :
            # Find only <script> tags whose src starts with JS_DIRECTORY_NAME.
            match = re.match('.*<script\s+src="' + JS_DIRECTORY_NAME + '/(?P<filename>.*)"', line, re.IGNORECASE)
            if match :
                jsFile = jsDir + '/' + match.groups('filename')[0]
                jsFiles.append(jsFile)
                print '[' + jsFile + ']'

                writeLine = False

                # Write out our minified JS script only once in place of one of
                # the scripts we found.
                if not wroteMinifiedJsLine :
                    wroteMinifiedJsLine = True
                    outputHtmlFile.write('\t\t<script src="%s/%s"></script>\n' % (JS_DIRECTORY_NAME, MINIFIED_JS_NAME))

        if writeLine :
            outputHtmlFile.write(line)

    outputHtmlFile.close()

    return jsFiles

# Call UglifyJS using node.js in order to minify the JavaScript file.
def minifyFile() :
    print "Calling UglifyJS now. This step takes several seconds."
    output = subprocess.check_output(['node', uglifyJsPath, minifiedJsFilePath])

    with open(minifiedJsFilePath, 'w') as minifiedJsFile :
        minifiedJsFile.write(output)

def main() :
    if not verifyArgs() : return -1

    jsFiles = findJsFilesToConsolidate()

    concatenateAllFiles(jsFiles)

    minifyFile()

    print "Done. Paths:"
    print "\tMinified JavaScript file: %s" % (minifiedJsFilePath)
    print "\tModified index.html: %s" % (outputHtmlFilePath)

if __name__ == '__main__':
    main()