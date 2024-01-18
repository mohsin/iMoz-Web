import yaml
import re

def convert_links_to_latex(data):
    if isinstance(data, list):
        return [convert_links_to_latex(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_links_to_latex(value) for key, value in data.items()}
    elif isinstance(data, str):
        # Convert Markdown-style links to LaTeX-style links
        return re.sub(r'\[(.*?)\]\((.*?)\)', r'\\href{\2}{\1}', data)
    else:
        return data

def read_yaml(file_path):
    with open(file_path, 'r') as file:
        data = yaml.safe_load(file)
    return data

def entry_experience(company, position, duration, location, summary, summary_in_resume=None):
    summary = convert_links_to_latex(summary_in_resume if summary_in_resume else summary)
    if isinstance(summary, list):
        summary = "\n".join(r"\item {}".format(item) for item in summary)
    else:
        summary = fr"\item {summary}"
    return r"\sectionsep" + "\n" \
             fr"\runsubsection{{{company}}}" + "\n" \
             fr"\descript{{| {position}}}" + "\n" \
             fr"\location{{{duration} | {location}}}" + "\n" \
             r"\vspace{\topsep}" + "\n" \
             r"\begin{tightemize}" + "\n" \
             r"\sectionsep" + "\n" \
             fr"{summary}" + "\n" \
             r"\end{tightemize}" + "\n" \
             r"\sectionsep"

def entry_volunteering(organization, role, duration, location, details):
    detail_items = "\n".join(fr"\item {item}" for item in details)
    return r"\sectionsep" + "\n" \
             fr"\runsubsection{{{organization}}}" + "\n" \
             fr"\descript{{| {role}}}" + "\n" \
             fr"\location{{{duration} | {location}}}" + "\n" \
             r"\begin{tightemize}" + "\n" \
             fr"{detail_items}" + "\n" \
             r"\end{tightemize}" + "\n" \
             r"\sectionsep"

def entry_education(institution, degree, duration, location, activities, description=None):
    if isinstance(degree, list):
        degree_info = fr"\descript{{| {degree[0]}}}" + "\n" + \
                      "\n".join(fr"\descript{{{item}}}" for item in degree[1:])
    else:
        degree_info = fr"\descript{{| {degree}}}"

    if isinstance(description, list):
        description_info = "\n".join(r"\item {}".format(item) for item in description)
    elif(description == None):
        description_info = ""
    else:
        description_info = fr"\item{{| {description}}}"

    return (
        r"\sectionsep" + "\n" \
        fr"\runsubsection{{{institution}}}" + "\n" +
        fr"{degree_info}" + "\n" +
        fr"\location{{{duration} | {location}}}" + "\n" +
        r"\begin{tightemize}" + "\n" +
        fr"\item Activities and societies: {', '.join(activities)}." + "\n" +
        (fr"{description_info}" + "\n" if description_info else "") +
        r"\end{tightemize}" + "\n" +
        r"\sectionsep")

def entry_skills(skills_data):
  result = ""

  for item in skills_data:
    for category, subcategories in item.items():
        result += fr"\subsection{{{category}}}" + "\n"
        result += r"\sectionsep" + "\n"

        if isinstance(subcategories, dict):
            for subcategory, items in subcategories.items():
                result += fr"\location{{{subcategory}:}}" + "\n"
                result += r" \textbullet{} ".join(items) + r" \\" + "\n" + r"\sectionsep" + "\n"
        elif isinstance(subcategories, list):
            result += r" \textbullet{} ".join(subcategories) + r" \\" + "\n"

        result += r"\sectionsep" + "\n"

  return result

def entry_languages(languages_data):
    result = ""

    for language_data in languages_data:
        language = language_data['language']
        proficiency = language_data['proficiency']

        result += "\n" + fr"\subsection{{{language}}}" + "\n"
        result += r"\sectionsep" + "\n"
        result += f"{proficiency}" + "\n"
        result += r"\sectionsep" + "\n"
        result += r"\sectionsep" + "\n"

    return result

def entry_hobby(hobby):
    return fr"\subsection{{{hobby}}}" + r"\sectionsep" + "\n"

def entry_project(project_data, first_project=True):
    result = ""

    # Check if the project should be shown on the resume
    show_on_resume = project_data.get('show_on_resume', False)
    if not show_on_resume:
        return result, first_project

    # Extract relevant information
    title = project_data['title']
    description_key = 'description_resume' if 'description_resume' in project_data else 'description'
    description = convert_links_to_latex(project_data.get(description_key, ''))
    website = project_data.get('website', '')
    location = project_data.get('location', '')
    duration = project_data.get('duration', '')
    designation = project_data.get('designation', '')

    # Format the output as per the provided template
    result += fr"\runsubsection{{{title}}}" + "\n"
    
    if website:
        result += fr"\descript{{| {website}}}" + "\n"

    if designation:
        result += fr"\descript{{| {designation}}}" + "\n"

    if location or duration:
        result += fr"\location{{{duration} | {location}}}" + "\n"
        if first_project: # Add extra space only for the first project
            result += r"\vspace{\topsep}" + "\n"
            first_project = False

    result += r"\begin{tightemize}" + "\n"
    result += fr"\sectionsep" + "\n"

    # Handle string or list descriptions
    if isinstance(description, list):
        for item in description:
            result += fr"\item {item}" + "\n"
    elif isinstance(description, str):
        result += fr"\item {description}" + "\n"

    result += r"\end{tightemize}" + "\n"
    result += fr"\sectionsep" + "\n"

    return result, first_project

def entry_publications(title, date, journal, impact_factor, details):
    result = ""

    # Format the output as per the provided template
    result += fr"\runsubsection{{{title}}}" + "\n"

    if date:
        result += fr"\descript{{| {date}}}" + "\n"

    if journal or impact_factor:
        result += fr"\location{{ {journal} (Impact Factor: {impact_factor}) }}" + "\n"

    result += r"\begin{tightemize}" + "\n"
    result += fr"\sectionsep" + "\n"

    for item in details:
        result += fr"\item {item}" + "\n"

    result += r"\end{tightemize}" + "\n"

    return result

def entry_honors(title, date, details, issued_by=None):
    result = fr"\runsubsection{{{title}}}" + "\n"

    if date:
        result += fr"\descript{{| {date}}}" + "\n"

    if issued_by:
        result += fr"\location{{ Issued by {issued_by} }}" + "\n"

    result += r"\begin{tightemize}" + "\n"
    result += fr"\sectionsep" + "\n"

    if isinstance(details, list):
        for item in details:
            result += fr"\item {item}" + "\n"
    else:
        result += fr"\item {details}" + "\n"

    result += fr"\sectionsep" + "\n"
    result += r"\end{tightemize}" + "\n"

    return result

def replace_placeholders(template, data, type = 'personal'):
    if isinstance(data, list):
        if (type == 'education'):
          sub_template = "\n\n".join(entry_education(**value) for value in data)
        elif(type == 'experience'):
          sub_template = "\n\n".join(entry_experience(**value) for value in data)
        elif(type == 'volunteering'):
          sub_template = "\n\n".join(entry_volunteering(**value) for value in data)
        elif(type == 'skills'):
          sub_template = entry_skills(data)
        elif(type == 'languages'):
          sub_template = entry_languages(data)
        elif(type == 'hobbies'):
          sub_template = ''.join(entry_hobby(value) for value in data)
        elif(type == 'publications'):
          sub_template = "\n\n".join(entry_publications(**value) for value in convert_links_to_latex(data))
        elif(type == 'honors'):
          sub_template = "\n".join(entry_honors(**value) for value in convert_links_to_latex(data))
        template = template.replace(f'% {type.title()} goes here', str(sub_template))
        return template
    
    if(type == 'projects'):
        projects_outputs = ""
        first_project_flag = True
        for _, projects_list in data.items():
            for project in projects_list:
                formatted_project_output, first_project_flag = entry_project(project, first_project_flag)
                if formatted_project_output:
                    projects_outputs += formatted_project_output + "\n"
        template = template.replace(f'% {type.title()} goes here', str(projects_outputs))
        return template

    for key, value in data.items():
        template = template.replace(f'\\{key}', str(value))
    return template

def main():
    # Read personal YAML file
    about = read_yaml('content/data/about.yml')
    personal = about['personal']
    education = about['education']
    experience = about['work']
    volunteering = about['volunteering']
    skills = about['skills']
    languages = about['languages']
    hobbies = about['hobbies']

    # Read projects YAML file
    projects = read_yaml('content/data/projects.yml')
    publications = about['publications']
    honors = about['honors']

    # Read LaTeX template
    with open('resume/main.tex', 'r') as file:
        template = file.read()

    # # Replace placeholders in the template
    template = replace_placeholders(template, personal)
    template = replace_placeholders(template, education, 'education')
    template = replace_placeholders(template, experience, 'experience')
    template = replace_placeholders(template, volunteering, 'volunteering')
    template = replace_placeholders(template, skills, 'skills')
    template = replace_placeholders(template, languages, 'languages')
    template = replace_placeholders(template, hobbies, 'hobbies')
    template = replace_placeholders(template, projects, 'projects')
    template = replace_placeholders(template, publications, 'publications')
    template = replace_placeholders(template, honors, 'honors')

    # Write the modified template to a new file
    with open('resume/main.tex', 'w') as file:
        file.write(template)

if __name__ == "__main__":
    main()
