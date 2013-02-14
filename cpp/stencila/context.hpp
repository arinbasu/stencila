/*
Copyright (c) 2012-2013 Stencila Ltd

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is 
hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD 
TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. 
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR 
CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA
OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, 
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

//! @file context.hpp
//! @brief Definition of class Context
//! @author Nokome Bentley

#pragma once

#include <string>

#include <stencila/component.hpp>

namespace Stencila {

template<class Derived=void>
class Context : public Component<Derived> {
protected:

	typedef std::string String;

public:

    static String type(void){
        return "context";
    };

    //! @brief 
    //! @param name
    //! @param expression
    void set(const String& name, const String& expression){
    }

    //! @brief 
    //! @param code
    void script(const String& code){
    }

    //! @brief 
    //! @param expression
    //! @return 
    String text(const String& expression){
        return "";
    }

    //! brief   
    //! @param expression
    //! @return 
    bool test(const String& expression){
        return false;
    }

    //! @brief 
    //! @param expression
    void subject(const String& expression){
    }

    //! @brief 
    //! @param expression
    //! @return 
    bool match(const String& expression){
        return false;
    }

    //! @brief 
    void enter(void){
    }
    
    //! @brief 
    //! @param expression
    void enter(const String& expression){
    }

    //! @brief 
    void exit(void){
    }

    //! @brief 
    //! @param item
    //! @param items
    //! @return 
    bool begin(const String& item,const String& items){
        return false;
    }

    //! @brief 
    //! @return 
    bool step(void){
        return false;
    }
    
    //! @name REST interface methods
    //! @{
	
    String post(const String& method, const Http::Uri& uri){
		if(method=="set"){
			String name = uri.field("name");
			String expression = uri.field("expression");
			if(name.length()==0) return R"({"error":"required field missing:'name'"})";
			if(expression.length()==0) return R"({"error":"required field missing:'expression'"})";
			static_cast<Derived*>(this)->set(name,expression);
			return "{}";
		} else if(method=="text"){
			String expression = uri.field("expression");
			if(expression.length()==0) return R"({"error":"required field missing:'expression'"})";
			String text = static_cast<Derived*>(this)->text(expression);
			return Format(R"({"return":"%s"})")<<text;
		} else {
			return Format(R"({"error":"unknown method: %s"})")<<method;
		}
    }
    
    //! @}
    
};

}
