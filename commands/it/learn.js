module.exports = {
	name: "learn",
    guildOnly: false,
	args: true,

	async execute (bot, msg, args) {
        const { MessageEmbed } = require("discord.js")
        const techno = args[0].toLowerCase()

        const linksEmbed = new MessageEmbed()
            .setFooter(__("request_from") + msg.author.username, msg.author.displayAvatarURL())
        
        if (techno === "c") {
            linksEmbed
                .setTitle(__("learn_c"))
                .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/CBook/)\n[${__("documentation")}](https://devdocs.io/c/)`)
                .addField(__("french"), `[Zeste de Savoir](https://zestedesavoir.com/tutoriels/755/le-langage-c-1/)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfEh6PCE39HERGgbbaIHhy4j)`)
                .setThumbnail("https://cdn.clipart.email/8ef145e648d53d25446c87ee512b638e_png-logo-download-transparent-png-clipart-free-download-ywd_1600-1600.png")
                .setColor("#6666FF")
        }
        else if (techno === "cpp" || techno === "c++") {
            linksEmbed
                .setTitle(__("learn_cpp"))
                .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/CPlusPlusBook/)\n[${__("documentation")}](https://en.cppreference.com/w/)`)
                .addField(__("french"), `[Zeste de Savoir](https://zestedesavoir.com/tutoriels/822/la-programmation-en-c-moderne/) (${__("create_account_to_access_beta")})\n[${__("video_formation")}](https://youtube.com/playlist?list=PLrSOXFDHBtfFKOzlm5iCBeXDTLxXdmxpx) (${__("not_finished")})`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/ISO_C%2B%2B_Logo.svg/1200px-ISO_C%2B%2B_Logo.svg.png")
                .setColor("#6666FF")
        }
        else if (techno === "csharp" || techno === "c#") {
            linksEmbed
                .setTitle(__("learn_csharp"))
                .addField(__("english"), `[${__("microsoft_learning_cs_material")}](https://dotnet.microsoft.com/learn/csharp)\n[C# 101](https://www.youtube.com/playlist?list=PLdo4fOcmZ0oVxKLQCHpiUWun7vlJJvUiN)\n[${__("documentation")} C#](https://docs.microsoft.com/en-us/dotnet/csharp/)\n[ASP.NET](https://docs.microsoft.com/en-us/aspnet/)`)
                .addField(__("french"), `[${__("documentation")} C#](https://docs.microsoft.com/fr-fr/dotnet/csharp/)\n[ASP.NET](https://docs.microsoft.com/fr-fr/aspnet/)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfGBHAMEg9Om9nF_7R7h5mO7) (${__("not_finished")})`)
                .setThumbnail("https://seeklogo.com/images/C/c-sharp-c-logo-02F17714BA-seeklogo.com.png")
                .setColor("#AA33FF")
        }
        else if (techno === "discordjs" || techno === "discord.js") {
            linksEmbed
                .setTitle(__("learn_discordjs"))
                .addField(__("english"), `[${__("complete_course")}](https://discordjs.guide/)\n[${__("documentation")}](https://discord.js.org/#/docs/main/stable/general/welcome)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/fr/thumb/0/05/Discord.svg/1200px-Discord.svg.png")
                .setColor("#7777FF")
        }
        else if (techno === "git") {
            linksEmbed
                .setTitle(__("learn_git"))   
                .addField(__("english"), `[${__("official_book")}](https://git-scm.com/book/en/v2)\n[Atlassian guide](https://www.atlassian.com/git)`)
                .addField(__("french"), `[${__("official_book")}](https://git-scm.com/book/fr/v2) (${__("english_version_translation")})\n[${__("video_formation")}](https://youtu.be/CEb_JM_hsFw)`)
                .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/778355939833151488/5847f981cef1014c0b5e48be.png")
                .setColor("#DE4C36")
        }
        else if (techno === "html" || techno === "css") {
            linksEmbed
                .setTitle(__("learn_html"))
                .addField(__("english"), `[${__("mdn_guide")}](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web)\n[${__("interneting_is_hard")}](https://www.internetingishard.com/)\n[${__("freecodecamp")}](https://www.freecodecamp.org/)\n[${__("html_book")}](https://www.freecodecamp.org/)\n[${__("css_book")}](https://books.goalkicker.com/CSSBook/)\n[${__("marksheet")}](https://marksheet.io/)\n[${__("mdn")}](https://developer.mozilla.org/en/)`)
                .addField(__("french"), `[${__("mdn_guide")}](https://developer.mozilla.org/fr/docs/Apprendre/Commencer_avec_le_web)\n[${__("grafikart_html")}](https://grafikart.fr/formations/html)\n[${__("grafikart_css")}](https://grafikart.fr/formations/css)\n[${__("mdn")}](https://developer.mozilla.org/fr/)`)
                .setThumbnail("https://cdn.discordapp.com/attachments/714381484617891980/805771805741547590/htmlcss.png")
                .setColor("#E44D26")
        }
        else if (techno === "java") {
            linksEmbed
                .setTitle(__("learn_java"))
                .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/JavaBook/)\n[${__("documentation")}](https://docs.oracle.com/javase)`)
                .addField(__("french"), `[${__("complete_course")}](https://koor.fr/Java/Tutorial/Index.wp) (${__("also_available")} [${__("on_youtube")}](https://www.youtube.com/playlist?list=PLBNheBxhHLQxfJhoz193-dRwvc2rl8AOW) ${__("as_video_formation")})\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfHkq8dd3BbSaopVgRSYtgPv) (${__("not_finished")})`)
                .setThumbnail("http://assets.stickpng.com/images/58480979cef1014c0b5e4901.png")
                .setColor("#EA2D2E")
        }
        else if (techno === "javascript" || techno === "js") {
            linksEmbed
                .setTitle(__("learn_javascript"))
                .addField(__("english"), `[JavaScript.info](https://javascript.info/)\n[${__("complete_book")}](https://books.goalkicker.com/JavaScriptBook/)\n[${__("nodejs_book")}](https://books.goalkicker.com/NodeJSBook/)`)
                .addField(__("french"), `[${__("mozilla_guide")}](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide)`)
                .setThumbnail("https://cdn.pixabay.com/photo/2015/04/23/17/41/javascript-736400_960_720.png")
                .setColor("#E4B400")
        }
        else if (techno === "php") {
            linksEmbed
                .setTitle(__("learn_php"))   
                .addField(__("english"), `[PHP the right way](https://phptherightway.com/)\n[${__("php_security_checklist")}](https://www.sqreen.com/checklists/php-security-checklist)\n[${__("documentation")}](https://www.php.net/docs.php)`)
                .addField(__("french"), `[PHP the right way](https://eilgin.github.io/php-the-right-way/) (${__("english_version_translation")})\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfFuZttC17M-jNpKnzUL5Adc)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/1024px-PHP-logo.svg.png")
                .setColor("#9999FF")
        }
        else if (techno === "python" || techno === "py") {
            linksEmbed
                .setTitle(__("learn_python"))
                .addField(__("english"), `[${__("complete_book")}](https://books.goalkicker.com/PythonBook/)\n[${__("documentation")}](https://docs.python.org/3/)`)
                .addField(__("french"), `[${__("pdf_course")}](https://inforef.be/swi/download/apprendre_python3_5.pdf)\n[${__("video_formation")}](https://www.youtube.com/playlist?list=PLrSOXFDHBtfHg8fWBd7sKPxEmahwyVBkC)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png")
                .setColor("#6666FF")
        }
        else if (techno === "reverse" || techno === "re" || techno === "assembly" || techno === "asm") {
            linksEmbed
                .setTitle(__("learn_reverse"))
                .addField(__("some_tools"), "[GDB](https://www.gnu.org/software/gdb/)\n[IDA](https://www.hex-rays.com/products/ida/)\n[Radare2](https://rada.re/)\n[Java Decompiler](http://java-decompiler.github.io/)")
                .addField(__("english"), `[${__("reverse_for_beginners")}](https://www.begin.re/)\n[${__("x86_nasm_by_example")}](https://asmtutor.com/)\n[${__("what_is_a_linux_executable")}](https://fasterthanli.me/blog/2020/whats-in-a-linux-executable/)\n[Crackmes](https://crackmes.one/)`)
                .addField(__("french"), `[${__("nasm_x86_course")}](http://www.pageperso.lif.univ-mrs.fr/~alexis.nasr/Ens/Compilation/cm06_x86.pdf)\n[Hackndo](https://beta.hackndo.com/archives/) (${__("contains_many_articles")})`)
                .setThumbnail("https://cdn.icon-icons.com/icons2/1155/PNG/512/1486564730-gears-cogs_81537.png")
                .setColor("#888888")
        }
        else if (techno === "rust" || techno === "rs") {
            linksEmbed
                .setTitle(__("learn_rust"))
                .addField(__("english"), `[${__("official_book")}](https://doc.rust-lang.org/book/)\n[${__("official_course_by_example")}](https://doc.rust-lang.org/stable/rust-by-example/)\n[Are we game yet?](http://arewegameyet.com/) (${__("game_development")})\n[${__("documentation")}](https://doc.rust-lang.org/std/)`)
                .addField(__("french"), `[${__("guillaume_gomez_blog")}](https://blog.guillaume-gomez.fr/Rust/)`)
                .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Rust_programming_language_black_logo.svg/1024px-Rust_programming_language_black_logo.svg.png")
                .setColor("#555555")
        }
        else {
            return msg.channel.send(`${__("no_learn_entry")} ${__("kirino_pout")}`)
        }
        
		msg.channel.send({ embeds: [linksEmbed] })
	}
}