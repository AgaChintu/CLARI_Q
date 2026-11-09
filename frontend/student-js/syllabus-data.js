// ==========================================
// CLARIQ - CENTRAL SYLLABUS CATALOGUE
// ==========================================
//
// Structure:
// Year → Semester → Branch → Subject → Topic → Subtopic
//
// This catalogue is shared data.
// Student forms, teacher forms and future features
// can all use the same source.
//
// Currently configured:
// Year 1  → Semester 1 → PPS
// Year 2  → Semester 3 → Existing ClariQ subjects
//
// More years, semesters and branches can be added
// without changing the structure.
// ==========================================


const CLARIQ_SYLLABUS = {

    academicYears: {

        1: {

            semesters: {

                1: {

                    branches: {

                        common: {

                            subjects: {

                                PPS: {

                                    id: "PPS",
                                    name: "Programming for Problem Solving",
                                    code: "BCS101",

                                    topics: [

                                        {
                                            id: "pps-introduction",
                                            name: "Introduction to Computer Systems",

                                            subtopics: [
                                                "Introduction to Computers",
                                                "Computer Generations",
                                                "Computer Hardware and Software",
                                                "Operating Systems",
                                                "Compiler and Interpreter",
                                                "Assembler, Linker and Loader",
                                                "Algorithms and Flowcharts"
                                            ]
                                        },

                                        {
                                            id: "pps-c-basics",
                                            name: "C Programming Fundamentals",

                                            subtopics: [
                                                "Structure of a C Program",
                                                "Character Set and Tokens",
                                                "Variables and Constants",
                                                "Data Types",
                                                "Input and Output Statements",
                                                "Operators and Expressions",
                                                "Type Conversion"
                                            ]
                                        },

                                        {
                                            id: "pps-control",
                                            name: "Operators and Control Statements",

                                            subtopics: [
                                                "Arithmetic Operators",
                                                "Relational and Logical Operators",
                                                "Conditional Statements",
                                                "Nested If-Else",
                                                "Switch Statements",
                                                "Conditional Operator"
                                            ]
                                        },

                                        {
                                            id: "pps-loops",
                                            name: "Loops, Arrays and Strings",

                                            subtopics: [
                                                "For Loop",
                                                "While Loop",
                                                "Do-While Loop",
                                                "Break and Continue",
                                                "One-Dimensional Arrays",
                                                "Two-Dimensional Arrays",
                                                "String Handling"
                                            ]
                                        },

                                        {
                                            id: "pps-functions",
                                            name: "Functions and Searching",

                                            subtopics: [
                                                "Function Declaration and Definition",
                                                "Function Arguments",
                                                "Call by Value",
                                                "Call by Reference",
                                                "Recursion",
                                                "Linear Search",
                                                "Binary Search",
                                                "Sorting Algorithms"
                                            ]
                                        },

                                        {
                                            id: "pps-pointers",
                                            name: "Pointers and File Handling",

                                            subtopics: [
                                                "Pointer Basics",
                                                "Pointer Arithmetic",
                                                "Pointers and Arrays",
                                                "Dynamic Memory Allocation",
                                                "Structures and Unions",
                                                "File Handling",
                                                "Preprocessor Directives"
                                            ]
                                        }

                                    ]

                                }

                            }

                        }

                    }

                }

            }

        },


        2: {

            semesters: {

                3: {

                    branches: {

                        common: {

                            subjects: {

                                DSA: {

                                    id: "DSA",
                                    name: "Data Structure",
                                    code: "BCS301",

                                    topics: [

                                        {
                                            id: "dsa-intro",
                                            name: "Introduction to Data Structures",

                                            subtopics: [
                                                "Data Types and Data Structures",
                                                "Linear and Non-Linear Structures",
                                                "Abstract Data Types",
                                                "Time and Space Complexity",
                                                "Asymptotic Notations"
                                            ]
                                        },

                                        {
                                            id: "dsa-arrays",
                                            name: "Arrays",

                                            subtopics: [
                                                "One-Dimensional Arrays",
                                                "Two-Dimensional Arrays",
                                                "Array Operations",
                                                "Sparse Matrices",
                                                "Applications of Arrays"
                                            ]
                                        },

                                        {
                                            id: "dsa-linked-lists",
                                            name: "Linked Lists",

                                            subtopics: [
                                                "Singly Linked List",
                                                "Doubly Linked List",
                                                "Circular Linked List",
                                                "Insertion and Deletion",
                                                "Traversal",
                                                "Applications of Linked Lists"
                                            ]
                                        },

                                        {
                                            id: "dsa-stacks",
                                            name: "Stacks and Queues",

                                            subtopics: [
                                                "Stack Operations",
                                                "Stack Implementation",
                                                "Infix, Prefix and Postfix",
                                                "Queue Operations",
                                                "Circular Queue",
                                                "Priority Queue",
                                                "Deque"
                                            ]
                                        },

                                        {
                                            id: "dsa-trees",
                                            name: "Trees",

                                            subtopics: [
                                                "Binary Trees",
                                                "Binary Search Trees",
                                                "Tree Traversals",
                                                "AVL Trees",
                                                "Heap",
                                                "Applications of Trees"
                                            ]
                                        },

                                        {
                                            id: "dsa-graphs",
                                            name: "Graphs",

                                            subtopics: [
                                                "Graph Representation",
                                                "Adjacency Matrix",
                                                "Adjacency List",
                                                "Breadth First Search",
                                                "Depth First Search",
                                                "Shortest Path"
                                            ]
                                        },

                                        {
                                            id: "dsa-sorting",
                                            name: "Searching and Sorting",

                                            subtopics: [
                                                "Linear Search",
                                                "Binary Search",
                                                "Bubble Sort",
                                                "Selection Sort",
                                                "Insertion Sort",
                                                "Merge Sort",
                                                "Quick Sort"
                                            ]
                                        }

                                    ]

                                },


                                COA: {

                                    id: "COA",
                                    name: "Computer Organization and Architecture",
                                    code: "BCS302",

                                    topics: [

                                        {
                                            id: "coa-basics",
                                            name: "Basic Computer Organization",

                                            subtopics: [
                                                "Functional Units of a Computer",
                                                "Von Neumann Architecture",
                                                "Computer Registers",
                                                "Bus Structure",
                                                "Instruction Cycle"
                                            ]
                                        },

                                        {
                                            id: "coa-data",
                                            name: "Data Representation",

                                            subtopics: [
                                                "Number Systems",
                                                "Binary Arithmetic",
                                                "Signed Number Representation",
                                                "Complements",
                                                "Floating Point Representation",
                                                "Character Representation"
                                            ]
                                        },

                                        {
                                            id: "coa-instructions",
                                            name: "Computer Instructions",

                                            subtopics: [
                                                "Instruction Formats",
                                                "Addressing Modes",
                                                "Instruction Types",
                                                "Register Transfer Language",
                                                "Control Instructions"
                                            ]
                                        },

                                        {
                                            id: "coa-cpu",
                                            name: "Central Processing Unit",

                                            subtopics: [
                                                "CPU Organization",
                                                "General Purpose Registers",
                                                "ALU",
                                                "Control Unit",
                                                "Hardwired Control",
                                                "Microprogrammed Control"
                                            ]
                                        },

                                        {
                                            id: "coa-memory",
                                            name: "Memory Organization",

                                            subtopics: [
                                                "Memory Hierarchy",
                                                "Cache Memory",
                                                "Cache Mapping",
                                                "Main Memory",
                                                "Associative Memory",
                                                "Virtual Memory"
                                            ]
                                        },

                                        {
                                            id: "coa-io",
                                            name: "Input and Output Organization",

                                            subtopics: [
                                                "I/O Interface",
                                                "Programmed I/O",
                                                "Interrupt Driven I/O",
                                                "DMA",
                                                "I/O Processors"
                                            ]
                                        },

                                        {
                                            id: "coa-pipeline",
                                            name: "Pipelining",

                                            subtopics: [
                                                "Instruction Pipelining",
                                                "Pipeline Stages",
                                                "Pipeline Hazards",
                                                "Data Hazards",
                                                "Control Hazards"
                                            ]
                                        }

                                    ]

                                },


                                DSTL: {

                                    id: "DSTL",
                                    name: "Discrete Structure & Theory of Logic",
                                    code: "BCS303",

                                    topics: [

                                        {
                                            id: "dstl-logic",
                                            name: "Mathematical Logic",

                                            subtopics: [
                                                "Propositions",
                                                "Logical Connectives",
                                                "Truth Tables",
                                                "Tautology and Contradiction",
                                                "Logical Equivalence",
                                                "Predicates and Quantifiers"
                                            ]
                                        },

                                        {
                                            id: "dstl-sets",
                                            name: "Set Theory",

                                            subtopics: [
                                                "Types of Sets",
                                                "Set Operations",
                                                "Power Sets",
                                                "Cartesian Products",
                                                "Venn Diagrams"
                                            ]
                                        },

                                        {
                                            id: "dstl-relations",
                                            name: "Relations",

                                            subtopics: [
                                                "Types of Relations",
                                                "Reflexive Relations",
                                                "Symmetric Relations",
                                                "Transitive Relations",
                                                "Equivalence Relations",
                                                "Partial Orders"
                                            ]
                                        },

                                        {
                                            id: "dstl-functions",
                                            name: "Functions",

                                            subtopics: [
                                                "Types of Functions",
                                                "Injective Functions",
                                                "Surjective Functions",
                                                "Bijective Functions",
                                                "Composition of Functions",
                                                "Inverse Functions"
                                            ]
                                        },

                                        {
                                            id: "dstl-algebra",
                                            name: "Algebraic Structures",

                                            subtopics: [
                                                "Groups",
                                                "Subgroups",
                                                "Cyclic Groups",
                                                "Rings",
                                                "Fields",
                                                "Homomorphism"
                                            ]
                                        },

                                        {
                                            id: "dstl-graphs",
                                            name: "Graph Theory",

                                            subtopics: [
                                                "Basic Graph Terminology",
                                                "Types of Graphs",
                                                "Degree of Vertices",
                                                "Paths and Circuits",
                                                "Connected Graphs",
                                                "Trees",
                                                "Planar Graphs"
                                            ]
                                        },

                                        {
                                            id: "dstl-combinatorics",
                                            name: "Combinatorics",

                                            subtopics: [
                                                "Permutations",
                                                "Combinations",
                                                "Pigeonhole Principle",
                                                "Recurrence Relations",
                                                "Mathematical Induction"
                                            ]
                                        }

                                    ]

                                },


                                DE: {

                                    id: "DE",
                                    name: "Digital Electronics",
                                    code: "DE",

                                    topics: [

                                        {
                                            id: "de-number",
                                            name: "Number Systems and Codes",

                                            subtopics: [
                                                "Binary Number System",
                                                "Octal and Hexadecimal Systems",
                                                "Number System Conversion",
                                                "Binary Arithmetic",
                                                "BCD Codes",
                                                "Gray Code"
                                            ]
                                        },

                                        {
                                            id: "de-logic",
                                            name: "Boolean Algebra and Logic Gates",

                                            subtopics: [
                                                "Boolean Laws",
                                                "Basic Logic Gates",
                                                "Universal Gates",
                                                "Boolean Expressions",
                                                "De Morgan's Theorems"
                                            ]
                                        },

                                        {
                                            id: "de-simplification",
                                            name: "Boolean Expression Simplification",

                                            subtopics: [
                                                "Karnaugh Maps",
                                                "SOP Form",
                                                "POS Form",
                                                "Minterms and Maxterms"
                                            ]
                                        },

                                        {
                                            id: "de-combinational",
                                            name: "Combinational Circuits",

                                            subtopics: [
                                                "Half Adder",
                                                "Full Adder",
                                                "Half Subtractor",
                                                "Full Subtractor",
                                                "Multiplexers",
                                                "Demultiplexers",
                                                "Encoders and Decoders"
                                            ]
                                        },

                                        {
                                            id: "de-sequential",
                                            name: "Sequential Circuits",

                                            subtopics: [
                                                "Latches",
                                                "SR Flip-Flop",
                                                "JK Flip-Flop",
                                                "D Flip-Flop",
                                                "T Flip-Flop",
                                                "Registers",
                                                "Counters"
                                            ]
                                        },

                                        {
                                            id: "de-converters",
                                            name: "Data Converters",

                                            subtopics: [
                                                "Digital to Analog Conversion",
                                                "Analog to Digital Conversion",
                                                "DAC",
                                                "ADC"
                                            ]
                                        }

                                    ]

                                },


                                Python: {

                                    id: "Python",
                                    name: "Python Programming",
                                    code: "BCC302",

                                    topics: [

                                        {
                                            id: "python-basics",
                                            name: "Python Fundamentals",

                                            subtopics: [
                                                "Introduction to Python",
                                                "Python Installation",
                                                "Variables and Constants",
                                                "Data Types",
                                                "Input and Output",
                                                "Type Conversion"
                                            ]
                                        },

                                        {
                                            id: "python-operators",
                                            name: "Operators and Control Flow",

                                            subtopics: [
                                                "Arithmetic Operators",
                                                "Comparison Operators",
                                                "Logical Operators",
                                                "If-Else Statements",
                                                "Nested Conditions",
                                                "For Loop",
                                                "While Loop"
                                            ]
                                        },

                                        {
                                            id: "python-collections",
                                            name: "Python Collections",

                                            subtopics: [
                                                "Lists",
                                                "Tuples",
                                                "Sets",
                                                "Dictionaries",
                                                "List Comprehensions",
                                                "String Operations"
                                            ]
                                        },

                                        {
                                            id: "python-functions",
                                            name: "Functions and Modules",

                                            subtopics: [
                                                "Defining Functions",
                                                "Function Arguments",
                                                "Lambda Functions",
                                                "Recursion",
                                                "Modules",
                                                "Packages"
                                            ]
                                        },

                                        {
                                            id: "python-oop",
                                            name: "Object-Oriented Programming",

                                            subtopics: [
                                                "Classes and Objects",
                                                "Constructors",
                                                "Inheritance",
                                                "Polymorphism",
                                                "Encapsulation",
                                                "Abstraction"
                                            ]
                                        },

                                        {
                                            id: "python-files",
                                            name: "File Handling and Exceptions",

                                            subtopics: [
                                                "Reading Files",
                                                "Writing Files",
                                                "File Modes",
                                                "Exception Handling",
                                                "Try and Except",
                                                "Custom Exceptions"
                                            ]
                                        },

                                        {
                                            id: "python-libraries",
                                            name: "Python Libraries",

                                            subtopics: [
                                                "NumPy Basics",
                                                "Pandas Basics",
                                                "Matplotlib Basics",
                                                "Working with Libraries"
                                            ]
                                        }

                                    ]

                                },


                                TC: {

                                    id: "TC",
                                    name: "Technical Communication",
                                    code: "BAS301",

                                    topics: [

                                        {
                                            id: "tc-communication",
                                            name: "Fundamentals of Communication",

                                            subtopics: [
                                                "Communication Process",
                                                "Types of Communication",
                                                "Verbal Communication",
                                                "Non-Verbal Communication",
                                                "Barriers to Communication"
                                            ]
                                        },

                                        {
                                            id: "tc-language",
                                            name: "Language and Grammar",

                                            subtopics: [
                                                "Parts of Speech",
                                                "Sentence Structure",
                                                "Tenses",
                                                "Vocabulary Building",
                                                "Common Errors in English"
                                            ]
                                        },

                                        {
                                            id: "tc-writing",
                                            name: "Technical Writing",

                                            subtopics: [
                                                "Paragraph Writing",
                                                "Precis Writing",
                                                "Technical Reports",
                                                "Formal Letters",
                                                "Email Writing",
                                                "Notice and Memo Writing"
                                            ]
                                        },

                                        {
                                            id: "tc-presentation",
                                            name: "Presentation Skills",

                                            subtopics: [
                                                "Presentation Planning",
                                                "Visual Aids",
                                                "Public Speaking",
                                                "Group Discussions",
                                                "Interview Skills"
                                            ]
                                        },

                                        {
                                            id: "tc-professional",
                                            name: "Professional Communication",

                                            subtopics: [
                                                "Resume Writing",
                                                "Job Applications",
                                                "Meetings",
                                                "Professional Etiquette",
                                                "Team Communication"
                                            ]
                                        }

                                    ]

                                }

                            }

                        }

                    }

                }

            }

        }

    }

};


// ==========================================
// CLASS ACADEMIC CONTEXT
// ==========================================
//
// These are prototype mappings.
// Later, the backend can provide this information
// from the student's actual class record.
// ==========================================

const CLARIQ_CLASS_ACADEMIC_CONTEXT = {

    "1-AIML": {
        academicYear: 1,
        semester: 1,
        branch: "common"
    },

    "1-CSE": {
        academicYear: 1,
        semester: 1,
        branch: "common"
    },

    "2-AIML": {
        academicYear: 2,
        semester: 3,
        branch: "common"
    },

    "2-CSE": {
        academicYear: 2,
        semester: 3,
        branch: "common"
    }

};


// ==========================================
// GET ACADEMIC CONTEXT
// ==========================================

function getClariQAcademicContext(classId) {

    return CLARIQ_CLASS_ACADEMIC_CONTEXT[classId] || {

        academicYear: 2,
        semester: 3,
        branch: "common"

    };

}


// ==========================================
// GET SUBJECTS FOR A CLASS
// ==========================================

function getClariQSubjects(classId) {

    const context = getClariQAcademicContext(classId);

    const subjects =
        CLARIQ_SYLLABUS.academicYears[context.academicYear]
            ?.semesters[context.semester]
            ?.branches[context.branch]
            ?.subjects || {};

    return Object.values(subjects);

}


// ==========================================
// GET TOPICS FOR A SUBJECT
// ==========================================

function getClariQTopics(classId, subjectId) {

    const context = getClariQAcademicContext(classId);

    const subject =
        CLARIQ_SYLLABUS.academicYears[context.academicYear]
            ?.semesters[context.semester]
            ?.branches[context.branch]
            ?.subjects[subjectId];

    return subject ? subject.topics : [];

}


// ==========================================
// GET SUBTOPICS FOR A TOPIC
// ==========================================

function getClariQSubtopics(classId, subjectId, topicId) {

    const topics = getClariQTopics(classId, subjectId);

    const topic = topics.find(item => item.id === topicId);

    return topic ? topic.subtopics : [];

}