#include <boost/python.hpp>
using namespace boost::python;

#include <stencila/sheet.hpp>
using namespace Stencila;

#include "spread.hpp"

Sheet& Sheet_attach(Sheet& self, object context) {
    self.attach(std::make_shared<PythonSpread>(context));
    return self;
}

BOOST_PYTHON_MEMBER_FUNCTION_OVERLOADS(Sheet_read,read,0,1)
BOOST_PYTHON_MEMBER_FUNCTION_OVERLOADS(Sheet_write,write,0,1)

void def_Sheet(void){
    class_<Sheet,bases<Component>>("Sheet")

        .def("initialise",&Sheet::initialise,return_self<>())

        .def("read",
            &Sheet::read,
            Sheet_read()[
                return_self<>()
            ]
        )
        .def("write",
            &Sheet::write,
            Sheet_write()[
                return_self<>()
            ]
        )

        .def("language",&Sheet::language)
        .def("title",&Sheet::title)
        .def("description",&Sheet::description)
        .def("keywords",&Sheet::keywords)
        .def("authors",&Sheet::authors)

        .def("serve",&Sheet::serve,return_self<>())
        .def("view",&Sheet::view,return_self<>())

        .def("page",
            static_cast<std::string (Sheet::*)(void) const>(&Sheet::page)
        )
        .def("page",
            static_cast<Sheet& (Sheet::*)(const std::string&)>(&Sheet::page),
            return_self<>()
        )

        .def("attach", Sheet_attach, return_self<>())
        .def("detach", &Sheet::detach, return_self<>())

        .def("update", static_cast<Sheet& (Sheet::*)(void)>(&Sheet::update), return_self<>())
    ;
}
